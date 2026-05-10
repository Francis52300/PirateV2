// ========================================================
// PWA INSTALLATION HANDLER (COLLER ICI, EN DERNIER)
// ========================================================

let deferredPrompt; // Variable pour stocker l'événement lorsqu'il est disponible

// 1. Écouter l'événement 'beforeinstallprompt'
window.addEventListener('beforeinstallprompt', (e) => {
    // Empêche le navigateur de montrer son propre prompt automatique
    e.preventDefault(); 
    
    // Stocke l'événement
    deferredPrompt = e;

    // 2. Afficher notre propre élément UI (le bouton)
    const installButton = document.getElementById('install-button'); 
    if (installButton) {
        installButton.style.display = 'block'; 
    }
    console.log("PWA Détectée : Le bouton d'installation est prêt.");
});


// 3. Gérer le clic sur notre bouton personnalisé
window.addEventListener('click', (e) => {
    if (!deferredPrompt) return; 

    // Déclencher l'installation réelle
    deferredPrompt.prompt(); 
    
    // Attendre la réponse de l'utilisateur
    deferredPrompt.userChoice.then((choice) => {
        if (choice === 'accepted') {
            console.log('L\'utilisateur a accepté l\'installation.');
        } else {
            console.log('L\'utilisateur a rejeté l\'installation.');
        }
        // Cacher le bouton après l'interaction
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    });
});

// Fin du code à coller
