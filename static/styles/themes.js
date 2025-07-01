const themes = {
    light: {
        background: '#f9f9f9',
        text: '#333',
        primary: '#007bff',
        secondary: '#6c757d',
        border: '#dee2e6',
        messageBackground: '#fff',
        messageColor: '#333',
        messageUserBackground: '#007bff',
        messageUserColor: '#fff',
    },
    dark: {
        background: '#343a40',
        text: '#f8f9fa',
        primary: '#007bff',
        secondary: '#6c757d',
        border: '#495057',
        messageBackground: '#495057',
        messageColor: '#f8f9fa',
        messageUserBackground: '#007bff',
        messageUserColor: '#fff',
    },
};

function applyTheme(theme) {
    const root = document.documentElement;
    for (const key in theme) {
        root.style.setProperty(`--${key}`, theme[key]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(themes[savedTheme]);
});
