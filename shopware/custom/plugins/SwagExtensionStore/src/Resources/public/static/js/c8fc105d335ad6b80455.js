(window["webpackJsonpPluginswag-extension-store"]=window["webpackJsonpPluginswag-extension-store"]||[]).push([[879],{8514:function(){},2879:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return s}}),n(4883);var s={name:"sw-extension-store-listing",template:'{% block sw_extension_store_listing %}\n    <div class="sw-extension-store-listing">\n        {% block sw_extension_store_listing_loader %}\n            <sw-loader v-if="isLoading"></sw-loader>\n        {% endblock %}\n\n        <sw-extension-store-statistics-promotion />\n\n        {% block sw_extension_store_listing_filter %}\n            <sw-extension-store-listing-filter></sw-extension-store-listing-filter>\n        {% endblock %}\n\n        {% block sw_extension_store_listing_grid %}\n            <div class="sw-extension-store-listing__listing-grid">\n                <template v-for="extension in extensions">\n                    {% block sw_extension_store_listing_card %}\n                        <sw-extension-listing-card :extension="extension"></sw-extension-listing-card>\n                    {% endblock %}\n                </template>\n            </div>\n        {% endblock %}\n\n        {% block sw_extension_store_listing_pagination %}\n            <sw-pagination v-bind="{ total, page, limit }" @page-change="setPage"></sw-pagination>\n        {% endblock %}\n    </div>\n{% endblock %}\n',inject:["feature"],mixins:["sw-extension-error"],data(){return{isLoading:!1}},computed:{extensions(){return Shopware.State.get("shopwareExtensions").extensionListing},currentSearch(){return Shopware.State.get("shopwareExtensions").search},page(){return this.currentSearch.page},limit(){return this.currentSearch.limit},total(){return this.extensions.total||0},rating(){return this.currentSearch.rating},languageId(){return Shopware.State.get("session").languageId},assetFilter(){return Shopware.Filter.getByName("asset")},currentLocale(){return"de-DE"===Shopware.State.get("session").currentLocale?"de":"en"}},watch:{currentSearch:{deep:!0,immediate:!0,handler(){this.getList()}},languageId(e){""!==e&&this.getList()}},methods:{async getList(){if(this.isLoading=!0,""!==this.languageId)try{await this.search()}catch(e){this.showExtensionErrors(e),this.$emit("extension-listing-errors",e)}finally{this.isLoading=!1}},async search(){let e=Shopware.Service("extensionStoreDataService"),t=await e.getExtensionList(Shopware.State.get("shopwareExtensions").search,{...Shopware.Context.api,languageId:Shopware.State.get("session").languageId});Shopware.State.commit("shopwareExtensions/setExtensionListing",t)},setPage({limit:e,page:t}){Shopware.State.commit("shopwareExtensions/setSearchValue",{key:"limit",value:e}),Shopware.State.commit("shopwareExtensions/setSearchValue",{key:"page",value:t})}}}},4883:function(e,t,n){var s=n(8514);s.__esModule&&(s=s.default),"string"==typeof s&&(s=[[e.id,s,""]]),s.locals&&(e.exports=s.locals),n(5346).Z("3e5d1fe5",s,!0,{})},5346:function(e,t,n){"use strict";function s(e,t){for(var n=[],s={},i=0;i<t.length;i++){var r=t[i],a=r[0],o={id:e+":"+i,css:r[1],media:r[2],sourceMap:r[3]};s[a]?s[a].parts.push(o):n.push(s[a]={id:a,parts:[o]})}return n}n.d(t,{Z:function(){return h}});var i="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!i)throw Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var r={},a=i&&(document.head||document.getElementsByTagName("head")[0]),o=null,l=0,c=!1,d=function(){},u=null,g="data-vue-ssr-id",p="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function h(e,t,n,i){c=n,u=i||{};var a=s(e,t);return f(a),function(t){for(var n=[],i=0;i<a.length;i++){var o=r[a[i].id];o.refs--,n.push(o)}t?f(a=s(e,t)):a=[];for(var i=0;i<n.length;i++){var o=n[i];if(0===o.refs){for(var l=0;l<o.parts.length;l++)o.parts[l]();delete r[o.id]}}}}function f(e){for(var t=0;t<e.length;t++){var n=e[t],s=r[n.id];if(s){s.refs++;for(var i=0;i<s.parts.length;i++)s.parts[i](n.parts[i]);for(;i<n.parts.length;i++)s.parts.push(v(n.parts[i]));s.parts.length>n.parts.length&&(s.parts.length=n.parts.length)}else{for(var a=[],i=0;i<n.parts.length;i++)a.push(v(n.parts[i]));r[n.id]={id:n.id,refs:1,parts:a}}}}function w(){var e=document.createElement("style");return e.type="text/css",a.appendChild(e),e}function v(e){var t,n,s=document.querySelector("style["+g+'~="'+e.id+'"]');if(s){if(c)return d;s.parentNode.removeChild(s)}if(p){var i=l++;t=x.bind(null,s=o||(o=w()),i,!1),n=x.bind(null,s,i,!0)}else t=S.bind(null,s=w()),n=function(){s.parentNode.removeChild(s)};return t(e),function(s){s?(s.css!==e.css||s.media!==e.media||s.sourceMap!==e.sourceMap)&&t(e=s):n()}}var m=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}();function x(e,t,n,s){var i=n?"":s.css;if(e.styleSheet)e.styleSheet.cssText=m(t,i);else{var r=document.createTextNode(i),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(r,a[t]):e.appendChild(r)}}function S(e,t){var n=t.css,s=t.media,i=t.sourceMap;if(s&&e.setAttribute("media",s),u.ssrId&&e.setAttribute(g,t.id),i&&(n+="\n/*# sourceURL="+i.sources[0]+" */\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(i))))+" */"),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}}}]);