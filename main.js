// Variables globales
let friends = [];
let sorteoCounter = 0;

// Elementos del DOM
const nameInput = document.getElementById('nameInput');
const addButton = document.getElementById('addButton');
const sortButton = document.getElementById('sortButton');
const clearAllButton = document.getElementById('clearAllButton');
const newDrawButton = document.getElementById('newDrawButton');
const themeToggle = document.getElementById('themeToggle');
const alertMessage = document.getElementById('alertMessage');
const friendsList = document.getElementById('friendsList');
const resultSection = document.getElementById('resultSection');
const resultName = document.getElementById('resultName');
const friendCount = document.getElementById('friendCount');
const sorteoCount = document.getElementById('sorteoCount');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadTheme();
    loadFriendsFromStorage();
    
    // Asegurar que el tema se aplique correctamente después de cargar
    setTimeout(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
    }, 100);
});

// Función de inicialización
function initializeApp() {
    updateFriendsList();
    updateStats();
    
    // Event listeners
    addButton.addEventListener('click', addFriend);
    sortButton.addEventListener('click', drawFriend);
    clearAllButton.addEventListener('click', clearAllFriends);
    newDrawButton.addEventListener('click', hideResult);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Permitir agregar amigos con Enter
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addFriend();
        }
    });
    
    // Limpiar alerta cuando el usuario empiece a escribir
    nameInput.addEventListener('input', function() {
        hideAlert();
        // Validar en tiempo real
        validateInput();
    });
    
    // Focus inicial en el input
    nameInput.focus();
}

// Validación de entrada en tiempo real
function validateInput() {
    const value = nameInput.value;
    const isValid = isValidName(value);
    
    nameInput.style.borderColor = value.length > 0 && !isValid ? 
        'var(--accent-error)' : 'var(--border-color)';
}

// Función para validar nombre
function isValidName(name) {
    // Verificar que solo contenga letras, espacios, acentos y caracteres especiales válidos
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
    
    // Verificar longitud mínima y máxima
    const minLength = 2;
    const maxLength = 50;
    
    // Verificar que no sea solo espacios
    const trimmedName = name.trim();
    
    return nameRegex.test(name) &&
           trimmedName.length >= minLength &&
           trimmedName.length <= maxLength &&
           trimmedName.length > 0;
}

// Función para agregar amigo
function addFriend() {
    const name = nameInput.value.trim();
    
    // Validar entrada vacía
    if (name === '') {
        showAlert('⚠️ Por favor, ingresa un nombre válido', 'warning');
        nameInput.focus();
        return;
    }
    
    // Validar formato del nombre
    if (!isValidName(name)) {
        showAlert('⚠️ El nombre solo puede contener letras, espacios y acentos', 'error');
        nameInput.focus();
        return;
    }
    
    // Validar longitud mínima
    if (name.length < 2) {
        showAlert('⚠️ El nombre debe tener al menos 2 caracteres', 'warning');
        nameInput.focus();
        return;
    }
    
    // Validar nombre duplicado (case insensitive)
    if (friends.some(friend => friend.toLowerCase() === name.toLowerCase())) {
        showAlert('⚠️ Este amigo ya está en la lista', 'warning');
        nameInput.focus();
        return;
    }
    
    // Validar límite máximo de amigos
    if (friends.length >= 50) {
        showAlert('⚠️ Has alcanzado el límite máximo de 50 amigos', 'warning');
        return;
    }
    
    // Capitalizar primera letra de cada palabra
    const formattedName = capitalizeWords(name);
    
    // Agregar amigo a la lista
    friends.push(formattedName);
    nameInput.value = '';
    nameInput.style.borderColor = 'var(--border-color)';
    nameInput.focus();
    
    // Actualizar interfaz
    updateFriendsList();
    updateStats();
    hideAlert();
    hideResult();
    saveFriendsToStorage();
    
    // Mostrar mensaje de éxito
    showSuccessMessage(`✅ ${formattedName} ha sido agregado a la lista`);
}

// Función para capitalizar palabras
function capitalizeWords(str) {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// Función para actualizar la lista de amigos
function updateFriendsList() {
    const sortButton = document.getElementById('sortButton');
    const clearButton = document.getElementById('clearAllButton');
    
    if (friends.length === 0) {
        friendsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends empty-icon"></i>
                <p>Aún no has agregado ningún amigo.</p>
                <p class="empty-subtitle">¡Comienza escribiendo un nombre arriba!</p>
            </div>
        `;
        sortButton.disabled = true;
        clearButton.classList.remove('visible');
    } else {
        friendsList.innerHTML = friends.map((friend, index) => `
            <div class="friend-item" data-index="${index}">
                <span class="friend-name">${friend}</span>
                <div class="friend-actions">
                    <span class="friend-number">${index + 1}</span>
                    <button class="btn-remove-friend" onclick="removeFriend(${index})" title="Eliminar amigo">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
        sortButton.disabled = false;
        clearButton.classList.add('visible');
    }
}

// Función para eliminar un amigo específico
function removeFriend(index) {
    if (index >= 0 && index < friends.length) {
        const removedFriend = friends[index];
        friends.splice(index, 1);
        updateFriendsList();
        updateStats();
        saveFriendsToStorage();
        hideResult();
        
        showSuccessMessage(`❌ ${removedFriend} ha sido eliminado de la lista`);
    }
}

// Función para realizar el sorteo
function drawFriend() {
    if (friends.length === 0) {
        showAlert('⚠️ Necesitas agregar al menos un amigo para realizar el sorteo', 'warning');
        return;
    }
    
    // Animación de sorteo
    showDrawAnimation();
    
    setTimeout(() => {
        // Selección aleatoria
        const randomIndex = Math.floor(Math.random() * friends.length);
        const selectedFriend = friends[randomIndex];
        
        // Mostrar resultado
        resultName.textContent = selectedFriend;
        resultSection.classList.add('show');
        
        // Actualizar contador de sorteos
        sorteoCounter++;
        updateStats();
        saveSorteoCount();
        
        // Scroll suave al resultado
        resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Efectos de confeti
        createConfetti();
        
    }, 2000);
}

// Animación de sorteo
function showDrawAnimation() {
    sortButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sorteando...';
    sortButton.disabled = true;
    
    let counter = 0;
    const animationInterval = setInterval(() => {
        if (friends.length > 0) {
            const randomFriend = friends[Math.floor(Math.random() * friends.length)];
            resultName.textContent = randomFriend;
            resultSection.classList.add('show');
        }
        counter++;
        
        if (counter >= 10) {
            clearInterval(animationInterval);
            sortButton.innerHTML = '<i class="fas fa-dice-six"></i> Sortear Amigo';
            sortButton.disabled = false;
        }
    }, 200);
}

// Función para crear efecto confeti
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                top: -10px;
                left: ${Math.random() * 100}vw;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                animation: confetti-fall 3s linear forwards;
                z-index: 9999;
                pointer-events: none;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 50);
    }
}

// CSS para animación de confeti
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    .btn-remove-friend {
        background: var(--accent-error);
        color: white;
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        transition: var(--transition);
        margin-left: 0.5rem;
        opacity: 0;
        visibility: hidden;
    }
    
    .friend-item:hover .btn-remove-friend {
        opacity: 1;
        visibility: visible;
    }
    
    .btn-remove-friend:hover {
        transform: scale(1.1);
        box-shadow: var(--shadow-light);
    }
    
    .friend-actions {
        display: flex;
        align-items: center;
    }
`;
document.head.appendChild(style);

// Función para limpiar toda la lista
function clearAllFriends() {
    if (friends.length === 0) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar todos los ${friends.length} amigos de la lista?`)) {
        friends = [];
        sorteoCounter = 0;
        updateFriendsList();
        updateStats();
        hideResult();
        saveFriendsToStorage();
        saveSorteoCount();
        
        showSuccessMessage('🗑️ Lista limpiada completamente');
    }
}

// Función para actualizar estadísticas
function updateStats() {
    friendCount.textContent = friends.length;
    sorteoCount.textContent = sorteoCounter;
    
    // Animar números
    animateNumber(friendCount);
    animateNumber(sorteoCount);
}

// Animación para números
function animateNumber(element) {
    element.style.transform = 'scale(1.2)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// Funciones para mostrar alertas y mensajes
function showAlert(message, type = 'error') {
    alertMessage.textContent = message;
    alertMessage.className = `alert show ${type}`;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

function hideAlert() {
    alertMessage.classList.remove('show');
}

function showSuccessMessage(message) {
    // Crear elemento de mensaje temporal
    const successDiv = document.createElement('div');
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-medium);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => {
            successDiv.remove();
        }, 500);
    }, 3000);
}

// CSS para animaciones de mensajes
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(messageStyle);

function hideResult() {
    resultSection.classList.remove('show');
}

// Funciones de tema
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Animación del botón con rotación
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeToggle.style.transform = 'rotate(0deg)';
    }, 300);
    
    // Debug para verificar el cambio
    console.log('Tema cambiado a:', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('Tema cargado:', savedTheme);
}

// Funciones de almacenamiento local
function saveFriendsToStorage() {
    try {
        localStorage.setItem('amigoSecreto_friends', JSON.stringify(friends));
    } catch (error) {
        console.warn('No se pudo guardar en localStorage:', error);
    }
}

function loadFriendsFromStorage() {
    try {
        const savedFriends = localStorage.getItem('amigoSecreto_friends');
        const savedSorteoCount = localStorage.getItem('amigoSecreto_sorteoCount');
        
        if (savedFriends) {
            friends = JSON.parse(savedFriends);
        }
        
        if (savedSorteoCount) {
            sorteoCounter = parseInt(savedSorteoCount);
        }
        
        updateFriendsList();
        updateStats();
    } catch (error) {
        console.warn('No se pudo cargar desde localStorage:', error);
        friends = [];
        sorteoCounter = 0;
    }
}

function saveSorteoCount() {
    try {
        localStorage.setItem('amigoSecreto_sorteoCount', sorteoCounter.toString());
    } catch (error) {
        console.warn('No se pudo guardar el contador de sorteos:', error);
    }
}

// Funciones de utilidad adicionales
function exportFriendsList() {
    if (friends.length === 0) {
        showAlert('⚠️ No hay amigos en la lista para exportar', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify({
        friends: friends,
        sorteoCount: sorteoCounter,
        exportDate: new Date().toISOString()
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'amigo-secreto-lista.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showSuccessMessage('📁 Lista exportada exitosamente');
}

function importFriendsList(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.friends && Array.isArray(data.friends)) {
                friends = data.friends;
                sorteoCounter = data.sorteoCount || 0;
                updateFriendsList();
                updateStats();
                saveFriendsToStorage();
                saveSorteoCount();
                showSuccessMessage('📁 Lista importada exitosamente');
            } else {
                showAlert('⚠️ Formato de archivo inválido', 'error');
            }
        } catch (error) {
            showAlert('⚠️ Error al leer el archivo', 'error');
        }
    };
    reader.readAsText(file);
}

// Atajos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter para sortear
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !sortButton.disabled) {
        drawFriend();
    }
    
    // Escape para cerrar resultado
    if (e.key === 'Escape' && resultSection.classList.contains('show')) {
        hideResult();
    }
    
    // Ctrl/Cmd + L para limpiar lista
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        nameInput.focus();
        nameInput.select();
    }
});

// Prevenir envío accidental del formulario
document.addEventListener('submit', function(e) {
    e.preventDefault();
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
    showAlert('⚠️ Ha ocurrido un error inesperado', 'error');
});

// Service Worker para funcionamiento offline 
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registrado: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW falló: ', registrationError);
            });
    });
}