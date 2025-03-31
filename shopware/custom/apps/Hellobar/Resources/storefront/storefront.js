// Hellobar Integration Script
(function() {
    // Create the Hellobar script element
    var script = document.createElement('script');
    script.src = 'https://my.hellobar.com/1cee5ce4692538f4d796978a42c9a6e938cf8d5a.js';
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    
    // Append the script to the document head
    document.head.appendChild(script);
    
    console.log('Hellobar script loaded for Shopware storefront');
})();