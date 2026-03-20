---
name: symfony-console-commands
description: >
  This skill should be used when the user asks to "create a console command",
  "write a CLI command", "run a batch import", "use AsCommand", "use SymfonyStyle",
  or discusses Symfony Command, ProgressBar, or batch processing patterns.
version: 1.0.0
---

## Console commands

```php
#[AsCommand(name: 'app:import-products', description: 'Bulk import from CSV')]
class ImportProductsCommand extends Command {
    public function __construct(
        private readonly ProductReader $reader,
        private readonly ProductImporter $importer,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $in, OutputInterface $out): int {
        $io = new SymfonyStyle($in, $out);
        $io->progressStart();

        foreach ($this->reader->getBatches(500) as $batch) {
            $this->importer->import($batch);
            $this->em->clear();            // free memory between batches
            $io->progressAdvance(count($batch));
        }

        $io->progressFinish();
        $io->success('Import complete.');
        return Command::SUCCESS;
    }
}
```
