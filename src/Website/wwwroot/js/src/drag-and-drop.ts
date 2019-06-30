(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const fileInput = document.getElementById('file');
        const drop = document.getElementById('dropzone');

        if (fileInput && fileInput instanceof HTMLInputElement && drop && drop instanceof HTMLDivElement) {
            drop.addEventListener('drop', e => {
                e.preventDefault();
                if (e.dataTransfer && e.dataTransfer.files) {
                    fileInput.files = e.dataTransfer.files;
                }
            });
        }
    });
})();