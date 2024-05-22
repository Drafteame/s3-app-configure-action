# S3 App Configure Action

GitHub action to help synchronize configuration files to an S3 bucket.

## Description

This GitHub Action allows you to synchronize configuration files to an S3 bucket. It's designed to streamline the
process of keeping configuration files up-to-date across your S3 storage.

## Inputs

| Input Name       | Description                                                                                           | Required | Default     |
| ---------------- | ----------------------------------------------------------------------------------------------------- | -------- | ----------- |
| `bucket`         | S3 bucket name to store and sync configurations                                                       | true     |             |
| `source`         | Source file that should be synced                                                                     | true     |             |
| `destination`    | Destination path on S3 bucket including final file name                                               | true     |             |
| `aws_access_key` | AWS Access Key Id                                                                                     | true     |             |
| `aws_secret_key` | AWS Secret Access Key                                                                                 | true     |             |
| `aws_region`     | AWS Region                                                                                            | false    | `us-east-1` |
| `dry_run`        | Do not create any persistent changes over the configurations and just show an overview of the changes | false    | false       |

## Runs

- **Using**: docker
- **Image**: Dockerfile

## Example Usage

To use this action in your GitHub workflow, you can add the following example to your `.github/workflows` directory as a YAML file (e.g., `sync-config.yml`):

```yaml
name: Sync Config to S3

on:
  push:
    branches:
      - main

jobs:
  sync-config:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Sync configuration to S3
        uses: Drafteame/s3-app-configure-action@main
        with:
          bucket: 'your-s3-bucket-name'
          source: 'path/to/source/config.json'
          destination: 'path/on/s3/config.json'
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws_region: 'us-east-1'
          dry_run: false
```

You can also use this action as a docker image on your pipeline to heal increase build time of the action:

```yaml
name: Sync Config to S3

on:
  push:
    branches:
      - main

jobs:
  sync-config:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Sync configuration to S3
        uses: docker://ghcr.io/drafteame/s3-app-configure-action:latest
        with:
          bucket: 'your-s3-bucket-name'
          source: 'path/to/source/config.json'
          destination: 'path/on/s3/config.json'
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws_region: 'us-east-1'
          dry_run: false
```
