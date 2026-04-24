# 🏴‍☠️ Pirate Quest — Installation PWA

## Structure des fichiers
```
pirate-quest/
├── index.html        ← Application principale
├── manifest.json     ← Métadonnées PWA
├── sw.js             ← Service Worker (cache offline)
├── icons/            ← Icônes (toutes tailles)
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── INSTALLATION.md   ← Ce fichier
```

---

## ⚙️ Prérequis — Serveur HTTPS

> ⚠️ **IMPORTANT** : Une PWA doit être servie en HTTPS (ou localhost).
> Ouvrir `index.html` directement dans le navigateur ne fonctionnera PAS
> pour le Service Worker.

---

## 🚀 Option 1 — Hébergement gratuit recommandé : GitHub Pages

1. Crée un compte sur [github.com](https://github.com)
2. Crée un nouveau dépôt public (ex: `pirate-quest`)
3. Upload tous les fichiers (glisser-déposer dans l'interface web)
4. Va dans **Settings → Pages → Source → main branch / root**
5. L'URL sera : `https://ton-pseudo.github.io/pirate-quest/`

### Installation sur Android (Chrome)
1. Ouvre l'URL GitHub Pages dans **Chrome**
2. Un bandeau doré apparaît en bas : **"⚓ Installer Pirate Quest"**
3. Clique **Installer** → l'app s'installe comme une vraie appli
4. Elle apparaît dans le tiroir d'applications

### Installation sur iPhone (Safari)
1. Ouvre l'URL dans **Safari**
2. Attends 3 secondes → un guide apparaît automatiquement
3. Appuie sur ⬆ **Partager** → **Sur l'écran d'accueil**
4. Confirme l'ajout

---

## 🚀 Option 2 — Netlify Drop (ultra-simple, sans compte requis)

1. Va sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glisse-dépose le dossier `pirate-quest/` entier
3. Netlify génère une URL HTTPS en 30 secondes
4. Partage l'URL avec les participants

---

## 🚀 Option 3 — Serveur local (test sur le réseau Wi-Fi local)

```bash
# Depuis le dossier pirate-quest/
python3 -m http.server 8080
# ou
npx serve .
```
Puis accède depuis le téléphone via l'IP locale : `http://192.168.x.x:8080`
*(Le Service Worker ne fonctionne pas en HTTP non-localhost, mais le jeu GPS fonctionne)*

---

## 📱 Fonctionnalités offline

Une fois installée et après une première utilisation connectée :
- ✅ L'application démarre sans connexion
- ✅ Les tuiles de carte déjà visitées sont disponibles
- ✅ Le GPS fonctionne toujours
- ✅ Les énigmes et la logique de jeu fonctionnent
- ⚠️  Les nouvelles zones de carte nécessitent une connexion

---

## 🔄 Mise à jour

Pour mettre à jour l'application après des modifications :
1. Modifie le numéro de version dans `sw.js` : `'pirate-quest-v2'`
2. Remplace les fichiers sur ton hébergement
3. Au prochain démarrage, un bandeau vert propose la mise à jour
