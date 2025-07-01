function createStyleSheet(styles) {
    const style = document.createElement('style');
    style.textContent = Object.entries(styles).map(([selector, rules]) => {
        const declarations = Object.entries(rules)
            .map(([property, value]) => `${property}: ${value};`)
            .join('\n');
        return `${selector} { ${declarations} }`;
    }).join('\n');
    document.head.appendChild(style);
}

const styles = {
    body: {
        fontFamily: 'sans-serif',
        margin: '0',
        padding: '0',
        backgroundColor: 'var(--background)',
        color: 'var(--text)',
    },
    '#app': {
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100vh',
        width: '100vw',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid var(--border)',
    },
    main: {
        padding: '1rem',
        overflowY: 'auto',
    },
    footer: {
        padding: '1rem',
        borderTop: '1px solid var(--border)',
    },
    '.chat-history': {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    '.message': {
        padding: '1rem',
        borderRadius: '0.5rem',
        maxWidth: '80%',
    },
    '.message.user': {
        backgroundColor: 'var(--messageUserBackground)',
        color: 'var(--messageUserColor)',
        alignSelf: 'flex-end',
    },
    '.message.bot': {
        backgroundColor: 'var(--messageBackground)',
        color: 'var(--messageColor)',
        alignSelf: 'flex-start',
    },
    '.chat-input': {
        display: 'flex',
        gap: '1rem',
    },
    'input[type="text"]': {
        flex: '1',
        padding: '0.5rem',
        borderRadius: '0.25rem',
        border: '1px solid var(--border)',
    },
    button: {
        padding: '0.5rem 1rem',
        borderRadius: '0.25rem',
        border: 'none',
        backgroundColor: 'var(--primary)',
        color: '#fff',
        cursor: 'pointer',
    },
    '@media (max-width: 768px)': {
        header: {
            flexDirection: 'column',
        },
        '.message': {
            maxWidth: '90%',
        },
    },
};

createStyleSheet(styles);
