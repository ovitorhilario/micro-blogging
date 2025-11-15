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
            postDiv.innerHTML = `
                <div class="post-header">
                    <span class="post-author">@${profileUsername}</span>
                    <span class="post-date">${formatDate(post.createdAt)}</span>
                </div>
                <div class="post-content">
                    ${processHashtags(post.content || '')}
                </div>
                <div class="post-actions">
                    <span class="post-action">
                        ❤️ ${post.likes ? post.likes.length : 0}
                    </span>
                    <span class="post-action">
                        💬 Comentários
                    </span>
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

// Tornar função global
window.toggleFollow = toggleFollow;

// Carregar perfil ao iniciar
loadProfile();
