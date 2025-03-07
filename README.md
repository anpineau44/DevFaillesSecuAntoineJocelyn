# Projet Node.js

## Prérequis

- Node.js (version 12 ou supérieure)
- SQL Server

## Installation

1. Initialisez le projet Node.js :
```bash
npm init -y  
```

2. Installez les dépendances :
```bash
npm install express mssql body-parser ejs cookie-parser express-session
```

3. Préparation de la base de données :

Pour vérifier que SQL Server accepte les connexions TCP/IP :
- Ouvrer SQL Server Configuration Manager
- Active TCP/IP dans SQL Server Network Configuration
- Redémarre SQL Server

Exécuter SCRIPT.sql pour créer la base de données.