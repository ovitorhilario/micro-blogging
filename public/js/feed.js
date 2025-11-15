// Página de Feed

requireAuth();

const userData = getUserData();

// Verificar se os dados do usuário estão disponíveis
if (!userData || !userData.username) {
    console.error('Dados do usuário não encontrados');
    logout(); // Redirecionar para login
}

const newPostForm = document.getElementById('newPostForm');
const postContent = document.getElementById('postContent');
const charCount = document.getElementById('charCount');
const postsContainer = document.getElementById('postsContainer');
const feedTitle = document.getElementById('feedTitle');
const profileLink = document.getElementById('profileLink');
const logoutBtn = document.getElementById('logoutBtn');

// Filtros do feed
const timelineBtn = document.getElementById('timelineBtn');
const myPostsBtn = document.getElementById('myPostsBtn');
const allBtn = document.getElementById('allBtn');
const hashtagSearchCard = document.getElementById('hashtagSearchCard');
const hashtagTitle = document.getElementById('hashtagTitle');
const clearHashtagBtn = document.getElementById('clearHashtagBtn');
const hashtagSearchForm = document.getElementById('hashtagSearchForm');
const hashtagSearchInput = document.getElementById('hashtagSearchInput');

// Estado atual do filtro
let currentFilter = 'timeline';
let currentHashtag = null;

// Configurar link do perfil
profileLink.href = `/profile.html?username=${userData.username}`;

// Carregar contador de posts do usuário
loadUserPostCount();

// Logout
logoutBtn.addEventListener('click', logout);

// Contador de caracteres
postContent.addEventListener('input', () => {
    const count = postContent.value.length;
    charCount.textContent = `${count}/280`;
    charCount.style.color = count > 280 ? '#e0245e' : '#777';
});

// Criar novo post
newPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const rawContent = postContent.value;
    const content = rawContent.trim();
    
    hideError('postErrorMessage');
    
    if (!rawContent || !content) {
        showError('postErrorMessage', 'Digite algo para publicar');
        return;
    }
    
    if (content.length > 280) {
        showError('postErrorMessage', 'O post não pode ter mais de 280 caracteres');
        return;
    }
    
    try {
        await apiPost('/posts', { content });
        
        postContent.value = '';
        charCount.textContent = '0/280';
        
        loadFeed();
        loadUserPostCount();
    } catch (error) {
        showError('postErrorMessage', error.message);
    }
});

// Event listeners dos filtros
timelineBtn.addEventListener('click', () => setFilter('timeline'));
myPostsBtn.addEventListener('click', () => setFilter('myPosts'));
allBtn.addEventListener('click', () => setFilter('all'));

// Event listener para limpar filtro de hashtag
clearHashtagBtn.addEventListener('click', clearHashtagFilter);

// Event listener para busca de hashtag
hashtagSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const hashtag = hashtagSearchInput.value.trim().replace('#', '');
    if (hashtag) {
        searchHashtag(hashtag);
    }
});

// Definir filtro ativo
function setFilter(filter) {
    currentFilter = filter;
    currentHashtag = null;
    
    // Esconder card de busca de hashtag
    hashtagSearchCard.style.display = 'none';
    
    // Atualizar botões ativos
    timelineBtn.classList.remove('active');
    myPostsBtn.classList.remove('active');
    allBtn.classList.remove('active');
    
    if (filter === 'timeline') {
        timelineBtn.classList.add('active');
        feedTitle.textContent = 'Timeline';
    } else if (filter === 'myPosts') {
        myPostsBtn.classList.add('active');
        feedTitle.textContent = 'Meus Posts';
    } else if (filter === 'all') {
        allBtn.classList.add('active');
        feedTitle.textContent = 'Todos os Posts';
    }
    
    loadFeed();
}

// Carregar contador de posts do usuário
async function loadUserPostCount() {
    try {
        const data = await apiGet(`/posts/user/${userData.username}`);
        const count = data.data.posts.length;
        document.getElementById('myPostsCount').textContent = count;
    } catch (error) {
        console.error('Erro ao carregar contador de posts:', error);
        document.getElementById('myPostsCount').textContent = '0';
    }
}

// Carregar feed baseado no filtro atual
async function loadFeed() {
    try {
        let data;
        
        if (currentHashtag) {
            // Filtro por hashtag tem prioridade
            data = await apiGet(`/posts/hashtag/${currentHashtag}`);
        } else if (currentFilter === 'timeline') {
            data = await apiGet('/posts/timeline');
        } else if (currentFilter === 'myPosts') {
            data = await apiGet(`/posts/user/${userData.username}`);
        } else if (currentFilter === 'all') {
            // Para "todos os posts", vamos combinar timeline e posts próprios
            const [timelineData, myPostsData] = await Promise.all([
                apiGet('/posts/timeline'),
                apiGet(`/posts/user/${userData.username}`)
            ]);
            
            // Combinar e remover duplicatas
            const allPosts = [...timelineData.data.posts, ...myPostsData.data.posts];
            const uniquePosts = allPosts.filter((post, index, self) => 
                index === self.findIndex(p => p._id === post._id)
            );
            
            // Ordenar por data (mais recentes primeiro)
            uniquePosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            data = { data: { posts: uniquePosts } };
        }
        
        renderPosts(data.data.posts);
    } catch (error) {
        postsContainer.innerHTML = `
            <p class="text-center error-message show">
                Erro ao carregar feed: ${error.message}
            </p>
        `;
    }
}

// Renderizar posts
function renderPosts(posts) {
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        let emptyMessage = '';
        if (currentHashtag) {
            emptyMessage = `Nenhum post encontrado com a hashtag #${currentHashtag}.`;
        } else if (currentFilter === 'timeline') {
            emptyMessage = 'Nenhum post na timeline. Que tal criar o primeiro?';
        } else if (currentFilter === 'myPosts') {
            emptyMessage = 'Você ainda não publicou nenhum post. Que tal criar o primeiro?';
        } else {
            emptyMessage = 'Nenhum post encontrado.';
        }
        
        postsContainer.innerHTML = `
            <div class="empty-state">
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        postsContainer.appendChild(renderPost(post));
    });
}

// Renderizar post
function renderPost(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    
    // Verificar se é post próprio
    const isOwnPost = post.username === userData.username;
    
    // Verificar se o usuário atual curtiu este post
    const isLiked = post.likes && post.likes.some(like => like.toString() === userData._id);
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-author-info">
                <img src="${post.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.username}" 
                     alt="Avatar de @${post.username}" 
                     class="post-avatar" 
                     onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=default'">
                <a href="/profile.html?username=${post.username}" class="post-author ${isOwnPost ? 'own-post' : ''}">@${post.username || 'usuário'}</a>
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
            ${isOwnPost ? `<span class="post-action delete-action" onclick="deletePost('${post._id}')">🗑️ Deletar</span>` : ''}
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
    return postDiv;
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
        
        loadFeed();
    } catch (error) {
        console.error('Erro ao curtir:', error);
    }
}

// Deletar post próprio
async function deletePost(postId) {
    if (!confirm('Tem certeza que deseja deletar este post?')) {
        return;
    }
    
    try {
        await apiDelete(`/posts/${postId}`);
        loadFeed();
        loadUserPostCount();
    } catch (error) {
        console.error('Erro ao deletar post:', error);
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
        commentsList.innerHTML = `<p class="text-center error-message show">Erro ao carregar comentários</p>`;
    }
}

// Renderizar comentário
function renderComment(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    
    const isOwnComment = comment.username === userData.username;
    const isLiked = comment.likes && comment.likes.some(like => like.toString() === userData._id);
    
    commentDiv.innerHTML = `
        <div class="comment-header">
            <a href="/profile.html?username=${comment.username}" class="comment-author">@${comment.username}</a>
            <span class="comment-date">${formatDate(comment.createdAt)}</span>
        </div>
        <div class="comment-content">${escapeHtml(comment.content)}</div>
        <div class="comment-actions">
            <span class="comment-action ${isLiked ? 'liked' : ''}" onclick="toggleCommentLike('${comment._id}', '${comment.postId}')">
                ❤️ ${comment.likes ? comment.likes.length : 0}
            </span>
            ${isOwnComment ? `<span class="comment-action delete-action" onclick="deleteComment('${comment._id}', '${comment.postId}')">🗑️</span>` : ''}
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
    
    if (!content) return;
    
    try {
        const response = await apiPost('/comments', { postId, content });
        textarea.value = '';
        
        // Adicionar comentário à lista sem recarregar tudo
        const commentsList = document.getElementById(`comments-list-${postId}`);
        const emptyMessage = commentsList.querySelector('.text-center');
        if (emptyMessage) {
            commentsList.innerHTML = '';
        }
        
        const newComment = response.data.comment;
        commentsList.insertBefore(renderComment(newComment), commentsList.firstChild);
        
        // Atualizar contador de comentários no post
        const commentButton = document.querySelector(`[onclick="toggleComments('${postId}')"]`);
        if (commentButton) {
            const currentCount = parseInt(commentButton.textContent.match(/\d+/)?.[0] || 0);
            commentButton.innerHTML = `💬 ${currentCount + 1}`;
        }
    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        alert('Erro ao criar comentário: ' + error.message);
    }
}

// Toggle curtida em comentário
async function toggleCommentLike(commentId, postId) {
    try {
        const likeButton = document.querySelector(`[onclick="toggleCommentLike('${commentId}', '${postId}')"]`);
        const isLiked = likeButton.classList.contains('liked');
        
        if (isLiked) {
            await apiDelete(`/comments/${commentId}/like`);
        } else {
            await apiPost(`/comments/${commentId}/like`);
        }
        
        await loadComments(postId);
    } catch (error) {
        console.error('Erro ao curtir comentário:', error);
    }
}

// Deletar comentário
async function deleteComment(commentId, postId) {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) {
        return;
    }
    
    try {
        await apiDelete(`/comments/${commentId}`);
        await loadComments(postId);
        
        // Atualizar contador de comentários no post
        const commentButton = document.querySelector(`[onclick="toggleComments('${postId}')"]`);
        if (commentButton) {
            const currentCount = parseInt(commentButton.textContent.match(/\d+/)?.[0] || 0);
            commentButton.innerHTML = `💬 ${Math.max(0, currentCount - 1)}`;
        }
    } catch (error) {
        console.error('Erro ao deletar comentário:', error);
        alert('Erro ao deletar comentário: ' + error.message);
    }
}

// Função auxiliar para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Buscar posts por hashtag
function searchHashtag(hashtag) {
    currentHashtag = hashtag;
    currentFilter = null;
    
    // Desativar todos os botões de filtro
    timelineBtn.classList.remove('active');
    myPostsBtn.classList.remove('active');
    allBtn.classList.remove('active');
    
    // Mostrar card de busca de hashtag
    hashtagSearchCard.style.display = 'block';
    hashtagTitle.textContent = `Posts com #${hashtag}`;
    feedTitle.textContent = `Resultados para #${hashtag}`;
    
    // Carregar posts com essa hashtag
    loadFeed();
}

// Limpar filtro de hashtag
function clearHashtagFilter() {
    currentHashtag = null;
    hashtagSearchCard.style.display = 'none';
    hashtagSearchInput.value = '';
    setFilter('timeline');
}

// Carregar feed ao iniciar
loadFeed();
