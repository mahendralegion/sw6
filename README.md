# Hellobar Shopware App

This project demonstrates how to create a Shopware 6 app for integrating Hellobar popups with Shopware stores.

## Requirements

- Docker and Docker Compose
- Node.js 14+ for running the mock server

## Setup

### 1. Start Shopware

```bash
docker compose up -d
```

### 2. Start the mock server

```bash
cd mock-server
npm install
npm start
```

### 3. Install and activate the Hellobar app

Once both Shopware and the mock server are running:

1. Access Shopware Admin at http://localhost/admin
2. Login with username `admin` and password `shopware`
3. Go to Settings > System > Apps
4. The Hellobar app should appear - click to install it
5. When prompted, allow the permissions

### 4. Configure Hellobar

1. Go to Settings > Shop > Sales Channels
2. Select your Storefront
3. Go to the "Hellobar Configuration" tab
4. Enable Hellobar and set the Account ID to `demo-account-123`
5. Save the configuration

## Testing

Visit your storefront at http://localhost. After a few seconds, you should see a popup appear at the top of the page.

## Development

The app structure follows standard Shopware app conventions:

- `shopware/custom/apps/Hellobar/` - Main app directory
- `shopware/custom/apps/Hellobar/manifest.xml` - App configuration
- `shopware/custom/apps/Hellobar/Resources/views/storefront/` - Storefront templates
- `mock-server/` - A simple server that mocks the Hellobar API for development purposes

## Extending for Production

For real production use, you would need to:

1. Set up a real authentication endpoint on your Rails app
2. Update the manifest.xml with your actual service URLs
3. Implement proper Shopware-to-Hellobar authentication
4. Support all Hellobar popup types and customizations

# Important Commands
```
bin/console cache:clear
bin/console app:refresh
bin/console theme:compile
```

and if you using docker 

```
docker exec -it shopware_app php bin/console app:refresh
docker exec -it shopware_app php bin/console theme:compile
docker exec -it shopware_app php bin/console cache:clear
```
