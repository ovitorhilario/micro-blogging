// Página de Perfil

requireAuth();

const currentUser = getUserData();
const urlParams = new URLSearchParams(window.location.search);
const profileUsername = urlParams.get('username') || currentUser.username;

const profileInfo = document.getElementById('profileInfo');
const userPostsContainer = document.getElementById('userPostsContainer');
const logoutBtn = document.getElementById('logoutBtn');

// Logout
logoutBtn.addEventListener('click', logout);

// Carregar perfil
async function loadProfile() {
    try {
        const data = await apiGet(`/users/${profileUsername}`);
        const user = data.data.user;
        
        const isOwnProfile = user.username === currentUser.username;
        
        // Verificar se está seguindo
        let isFollowing = false;
        if (!isOwnProfile && user.followers) {
            isFollowing = user.followers.some(followerId => followerId.toString() === currentUser._id);
        }
        
        profileInfo.innerHTML = `
            <div class="profile-header">
                <div class="profile-info">
                    <img src="${user.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username}" 
                         alt="Avatar de @${user.username}" 
                         class="profile-avatar" 
                         onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=default'">
                    <h2>${user.username}</h2>
                    <p class="profile-username">@${user.username}</p>
                    <p class="profile-bio">${user.bio || 'Sem bio'}</p>
                    <div class="profile-stats">
                        <span><strong>${user.followers ? user.followers.length : 0}</strong> seguidores</span>
                        <span><strong>${user.following ? user.following.length : 0}</strong> seguindo</span>
                    </div>
                </div>
                ${!isOwnProfile ? `
                    <button id="followBtn" class="btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}" onclick="toggleFollow()">
                        ${isFollowing ? 'Deixar de seguir' : 'Seguir'}
                    </button>
                ` : ''}
            </div>
        `;
        
        loadUserPosts();
    } catch (error) {
        profileInfo.innerHTML = `
            <p class="error-message show">Erro ao carregar perfil: ${error.message}</p>
        `;
    }
}

// Carregar posts do usuário
async function loadUserPosts() {
    try {
        const data = await apiGet(`/posts/user/${profileUsername}`);
        
        userPostsContainer.innerHTML = '';
        
        if (data.data.posts.length === 0) {
            userPostsContainer.innerHTML = `
                <div class="empty-state">
                    <p>Nenhum post ainda</p>
                </div>
            `;
            return;
        }
        
        data.data.posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            
            // Verificar se o usuário atual curtiu este post
            const isLiked = post.likes && post.likes.some(like => like.toString() === currentUser._id);
            
            postDiv.innerHTML = `
                <div class="post-header">
                    <div class="post-author-info">
                        <img src="${post.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profileUsername}" 
                             alt="Avatar de @${profileUsername}" 
                             class="post-avatar" 
                             onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=default'">
                        <span class="post-author">@${profileUsername}</span>
                    </div>
                    <span class="post-date">${formatDate(post.createdAt)}</span>
                </div>
                <div class="post-content">
                    ${processHashtags(post.content || '')}
                </div>
                <div class="post-actions">
                    <span class="post-action ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
                        ❤️ ${post.likes ? post.likes.length : 0}
                    </span>
                    <span class="post-action" onclick="toggleComments('${post._id}')">
                        💬 ${post.commentsCount || 0}
                    </span>
                    ${profileUsername === currentUser.username ? `<span class="post-action delete-action" onclick="deletePost('${post._id}')">🗑️ Deletar</span>` : ''}
                </div>
                <div id="comments-${post._id}" class="comments-section" style="display: none;">
                    <div class="comments-list" id="comments-list-${post._id}">
                        <p class="text-center loading">Carregando comentários...</p>
                    </div>
                    <form class="comment-form" onsubmit="submitComment(event, '${post._id}')">
                        <textarea placeholder="Escreva um comentário..." maxlength="280" required></textarea>
                        <button type="submit" class="btn btn-primary btn-small">Comentar</button>
                    </form>
                </div>
            `;
            userPostsContainer.appendChild(postDiv);
        });
    } catch (error) {
        userPostsContainer.innerHTML = `
            <p class="error-message show">Erro ao carregar posts: ${error.message}</p>
        `;
    }
}

// Toggle like
async function toggleLike(postId) {
    try {
        // Encontrar o botão de like para este post
        const likeButton = document.querySelector(`[onclick="toggleLike('${postId}')"]`);
        const isLiked = likeButton.classList.contains('liked');
        
        if (isLiked) {
            // Descurtir
            await apiDelete(`/posts/${postId}/like`);
        } else {
            // Curtir
            await apiPost(`/posts/${postId}/like`);
        }
        
        loadProfile();
    } catch (error) {
        console.error('Erro ao curtir:', error);
    }
}

// Toggle seção de comentários
async function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        // Carregar comentários
        await loadComments(postId);
    } else {
        commentsSection.style.display = 'none';
    }
}

// Carregar comentários de um post
async function loadComments(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);
    
    try {
        const data = await apiGet(`/comments/post/${postId}`);
        const comments = data.data.comments;
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="text-center">Seja o primeiro a comentar!</p>';
            return;
        }
        
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            commentsList.appendChild(renderComment(comment));
        });
    } catch (error) {
        commentsList.innerHTML = '<p class="error-message show">Erro ao carregar comentários</p>';
    }
}

// Renderizar comentário
function renderComment(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.innerHTML = `
        <div class="comment-header">
            <div class="comment-author-info">
                <img src="${comment.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.username}" 
                     alt="Avatar de @${comment.username}" 
                     class="comment-avatar" 
                     onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=default'">
                <a href="/profile.html?username=${comment.username}" class="comment-author">@${comment.username}</a>
            </div>
            <span class="comment-date">${formatDate(comment.createdAt)}</span>
        </div>
        <div class="comment-content">
            ${processHashtags(comment.content || '')}
        </div>
    `;
    return commentDiv;
}

// Submeter comentário
async function submitComment(event, postId) {
    event.preventDefault();
    
    const form = event.target;
    const textarea = form.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content) {
        return;
    }
    
    try {
        await apiPost('/comments', { postId, content });
        textarea.value = '';
        await loadComments(postId);
        // Atualizar contador de comentários
        loadProfile();
    } catch (error) {
        console.error('Erro ao comentar:', error);
    }
}

// Toggle follow
async function toggleFollow() {
    try {
        const followBtn = document.getElementById('followBtn');
        const isFollowing = followBtn.textContent.trim() === 'Deixar de seguir';
        
        if (isFollowing) {
            await apiDelete(`/users/${profileUsername}/follow`);
        } else {
            await apiPost(`/users/${profileUsername}/follow`);
        }
        
        loadProfile();
    } catch (error) {
        console.error('Erro ao seguir/deixar de seguir:', error);
    }
}

// Deletar post próprio
async function deletePost(postId) {
    if (!confirm('Tem certeza que deseja deletar este post?')) {
        return;
    }
    
    try {
        await apiDelete(`/posts/${postId}`);
        loadProfile();
    } catch (error) {
        console.error('Erro ao deletar post:', error);
    }
}

loadProfile();