Original prompt: por favor, revisa todo el codigo y refactorizalo a una app segura y funcional, todo el codigo.

- Se refactorizo la app en modulos: `main.js`, `hand_tracker.js`, `ui.js`, `app_config.js`, `animals_data.js`, `entities.js`.
- Se elimino la dependencia de `camera_utils` y `drawing_utils`; la camara ahora usa `getUserMedia` directo y un loop propio.
- Se agrego CSP por `meta` para reducir la superficie de ataque en esta app estatica.
- Se eliminaron usos de `innerHTML` y de estilos inline dinamicos.
- Se expuso `window.render_game_to_text` y `window.advanceTime` para pruebas.
- Verificacion local: `node --check` paso en `main.js`, `hand_tracker.js`, `ui.js`, `entities.js`, `animals_data.js`, `app_config.js`.
- Barrido rapido de seguridad: no quedaron usos de `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `localStorage`, `sessionStorage`, `postMessage` ni acceso a `.style`.
- Pendiente: verificar la experiencia real en navegador con camara y confirmar si la carga de MediaPipe desde CDN funciona bien en este entorno.
