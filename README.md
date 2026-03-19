# Pimcore Development Skills

> Expert-level Claude skill pack for PHP · Symfony · Pimcore development teams.
> Maintained by [Credencys](https://github.com/mahek-credencys).

## What is this?

A structured skill registry for **Claude Code** and the **Manage Plugin** marketplace.
Install once — every developer on your team gets the same 28 expert-level skills
loaded into their Claude session automatically.

## Skill categories

| Category | Skills | Level |
|---|---|---|
| PHP foundations | PHP 8.x, OOP & SOLID, Composer, OPcache | Expert |
| Symfony core | Service container, Routing, Events, Lazy services | Expert |
| Doctrine ORM | Entities, QueryBuilder, Lazy loading, Migrations | Expert |
| Pimcore | Data objects, Documents, Datahub/API, Full-page cache | Expert |
| Superpower skills | Messenger, Console commands, Custom bundles, Security | Expert |
| Performance & ops | Profiling, Redis, Elasticsearch, CI/CD & Docker | Expert |
| Testing & DX | PHPUnit, Functional testing, PHPStan, CS Fixer | Expert |

## Quick install

### Via Claude Code CLI
```bash
git clone https://github.com/mahek-credencys/pimcore-development-skills \
  ~/.claude/skills/pimcore-development-skills

claude skills install php-symfony-pimcore-expert \
  --source ~/.claude/skills/pimcore-development-skills/engineering/index.json
```

### Via raw URL
```bash
claude skills add \
  https://raw.githubusercontent.com/mahek-credencys/pimcore-development-skills/main/engineering/index.json
```

### Via Manage Plugin UI
Paste into the **Install from repo** tab:
```
https://github.com/mahek-credencys/pimcore-development-skills
```

## Team setup (Makefile)

```makefile
skills-install:
	git clone https://github.com/mahek-credencys/pimcore-development-skills \
	  ~/.claude/skills/pimcore-development-skills || \
	  git -C ~/.claude/skills/pimcore-development-skills pull
	claude skills install php-symfony-pimcore-expert

skills-update:
	git -C ~/.claude/skills/pimcore-development-skills pull origin main
	claude skills sync
```

```bash
make skills-install   # first-time setup
make skills-update    # pull latest changes
```

## Repo structure

```
pimcore-development-skills/
├── README.md
├── engineering/
│   ├── index.json                              ← skill pack registry
│   └── php-symfony-pimcore/
│       ├── MANIFEST.md
│       ├── php-foundations.md
│       ├── symfony-core.md
│       ├── doctrine-orm.md
│       ├── pimcore.md
│       ├── superpower-skills.md
│       ├── performance-ops.md
│       └── testing-dx.md
└── .claude/
    └── skills.json                             ← Claude Code reads on startup
```

## Contributing

1. Fork the repo
2. Add or update a skill file under `engineering/php-symfony-pimcore/`
3. Update `engineering/index.json` if adding a new file
4. Open a PR with a clear description of what changed

## License

MIT — free to use, fork, and share across your team.
