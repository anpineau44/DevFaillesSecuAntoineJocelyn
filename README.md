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

-------------------------------------------------------
## Edit par Arthur TITOS
- Après de nombreuses tentatives, la connection au serveur SQL est toujours en timeout.
La configuration de l'user est la suivante : 
```bash
Server name : MSSQLSERVER2
Login : Both Windows / SQL
Protocole réseau : TCP/IP actif
User Name : userTest
Password : oui123
Droits : System Admin / Possibilité de se connecté en SQL
trustServerCertificate : true
```
- De plus la connexion via l'outil SSMS est possible avec l'utilisateur.
- Donc les corrections sont donnés sans être testé intégralement
