# Scripts SQL — version distante

Variante des scripts `01_schema.sql` / `02_seed.sql` adaptée aux
hébergeurs qui imposent un nom de base préfixé (AlwaysData,
Clever Cloud, Aiven, Railway…) :

- la base est créée par l'**interface web** de l'hébergeur,
- les scripts ci-dessous ne contiennent donc **plus** de
  `CREATE DATABASE` / `USE` / `DROP DATABASE`,
- ils doivent être exécutés **en étant déjà connecté à la base**.

## Import via le client mysql (recommandé)

```bash
mysql -h mysql-<compte>.alwaysdata.net -P 3306 \
      -u <compte>_<user> -p \
      <compte>_<base> \
      --default-character-set=utf8mb4 < 01_schema_remote.sql

mysql -h mysql-<compte>.alwaysdata.net -P 3306 \
      -u <compte>_<user> -p \
      <compte>_<base> \
      --default-character-set=utf8mb4 < 02_seed_remote.sql
```

Sous Windows PowerShell, contourner la conversion d'encodage :

```powershell
cmd /c '"C:\xampp\mysql\bin\mysql.exe" -h mysql-XXX.alwaysdata.net -P 3306 -u XXX_user -pMOT_DE_PASSE XXX_base --default-character-set=utf8mb4 < "C:\Users\Sylvain\Desktop\trouve-ton-artisan\database\remote\01_schema_remote.sql"'
cmd /c '"C:\xampp\mysql\bin\mysql.exe" -h mysql-XXX.alwaysdata.net -P 3306 -u XXX_user -pMOT_DE_PASSE XXX_base --default-character-set=utf8mb4 < "C:\Users\Sylvain\Desktop\trouve-ton-artisan\database\remote\02_seed_remote.sql"'
```

## Import via phpMyAdmin AlwaysData

1. Bases de données → MySQL → cliquer sur `phpMyAdmin`.
2. Se connecter avec son utilisateur applicatif.
3. Sélectionner la base à gauche.
4. Onglet **Importer** → choisir `01_schema_remote.sql` → **Exécuter**.
5. Recommencer avec `02_seed_remote.sql`.
