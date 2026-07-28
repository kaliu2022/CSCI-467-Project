(function () {
    const links = [
        { href: 'createQuote.html', label: 'Create Quote' },
        { href: 'editQuote.html', label: 'Edit Quote' },
        { href: 'convertQuote.html', label: 'Process Orders' }
    ];

    const nav = document.querySelector('.site-header nav');
    const linksHtml = links.map(({ href, label }) => `<a href="${href}">${label}</a>`).join('\n');

    nav.insertAdjacentHTML('afterbegin', linksHtml);
})();
