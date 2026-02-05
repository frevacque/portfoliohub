# 🐳 Installation avec Docker (Alternative simple)

Si vous préférez une installation ultra-simple sans configurer Python/Node manuellement, utilisez Docker.

---

## 📋 Prérequis unique : Docker Desktop

### Installation de Docker Desktop sur Mac

1. Téléchargez Docker Desktop : https://www.docker.com/products/docker-desktop/
2. Installez l'application
3. Lancez Docker Desktop
4. Attendez que l'icône Docker dans la barre de menu indique "Docker Desktop is running"

---

## 🚀 Démarrage en une commande

Ouvrez le Terminal, allez dans le dossier du projet et exécutez :

```bash
cd ~/Documents/PortfolioHub
docker-compose up
```

C'est tout ! L'application sera disponible sur http://localhost:3000

---

## 🛑 Arrêt

Appuyez sur `Ctrl+C` dans le terminal, puis :

```bash
docker-compose down
```

---

## 🔄 Utilisation quotidienne

```bash
cd ~/Documents/PortfolioHub
docker-compose up
```

---

## 💾 Sauvegarde des données

Vos données sont stockées dans un volume Docker. Pour sauvegarder :

```bash
# Créer une sauvegarde
docker exec portfoliohub-db mongodump --db portfoliohub --out /dump
docker cp portfoliohub-db:/dump ~/Documents/backup_portfolio

# Restaurer une sauvegarde
docker cp ~/Documents/backup_portfolio portfoliohub-db:/dump
docker exec portfoliohub-db mongorestore --db portfoliohub /dump/portfoliohub
```

---

## ⚠️ Avantages et inconvénients

### ✅ Avantages Docker
- Installation ultra-simple (1 seul prérequis)
- Environnement isolé
- Même configuration partout

### ⚠️ Inconvénients Docker
- Docker Desktop utilise ~2-4 Go de RAM
- Démarrage plus lent (~30 secondes)
- Nécessite Docker Desktop en cours d'exécution

---

## 💡 Recommandation

- **Utilisez Docker** si vous voulez la simplicité maximale
- **Utilisez l'installation native** (voir INSTALLATION_MAC.md) si vous voulez de meilleures performances
