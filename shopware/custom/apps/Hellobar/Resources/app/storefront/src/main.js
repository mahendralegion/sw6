// Hellobar Storefront Integration
import { PluginManager } from 'src/plugin-system/plugin.manager';
import './hellobar-plugin';

class HellobarPlugin extends PluginManager.getBasePluginClass() {
    init() {
        // Create the Hellobar script element
        const script = document.createElement('script');
        script.src = 'https://my.hellobar.com/1cee5ce4692538f4d796978a42c9a6e938cf8d5a.js';
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.async = true;
        
        // Append the script to the document head
        document.head.appendChild(script);
        
        console.log('Hellobar script loaded for Shopware storefront');
    }
}

// Register the plugin
PluginManager.register('HellobarPlugin', HellobarPlugin, '[data-hellobar]');

// Add data attribute to body when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    document.body.setAttribute('data-hellobar', 'true');
});