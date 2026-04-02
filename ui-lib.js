(function(global) {
    'use strict';

    const injectStyles = () => {
        if (document.getElementById('custom-ui-builder-styles')) return;
        const style = document.createElement('style');
        style.id = 'custom-ui-builder-styles';
        style.textContent = `
            .cub-container {
                position: fixed;
                top: 80px;
                right: 30px;
                background: rgba(26, 28, 35, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.4);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: opacity 0.3s ease;
            }
            .cub-header {
                background: rgba(0, 0, 0, 0.2);
                padding: 12px 20px;
                font-size: 16px;
                font-weight: 600;
                cursor: grab;
                user-select: none;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cub-header:active {
                cursor: grabbing;
            }
            .cub-close {
                cursor: pointer;
                color: #ff5f56;
                background: rgba(255, 95, 86, 0.1);
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transition: all 0.2s;
            }
            .cub-close:hover {
                background: #ff5f56;
                color: #fff;
            }
            .cub-content {
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .cub-input {
                padding: 10px 14px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background-color: rgba(0, 0, 0, 0.3);
                color: #fff;
                outline: none;
                font-size: 14px;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .cub-input:focus {
                border-color: #007bff;
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
            }
            .cub-text {
                font-size: 14px;
                margin: 0;
                color: #aeb2b8;
                text-align: center;
                white-space: pre-line;
            }
            .cub-img {
                border-radius: 50%;
                object-fit: cover;
                align-self: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                border: 2px solid rgba(255,255,255,0.1);
                margin: 10px 0;
            }
            .cub-btn {
                padding: 10px 15px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s;
                color: white;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            .cub-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                box-shadow: none;
            }
            .cub-btn-blue { 
                background: linear-gradient(135deg, #007bff, #0056b3); 
            }
            .cub-btn-blue:hover:not(:disabled) { 
                filter: brightness(1.1); 
                transform: translateY(-1px);
            }
            .cub-btn-green { 
                background: linear-gradient(135deg, #28a745, #1e7e34); 
            }
            .cub-btn-green:hover:not(:disabled) { 
                filter: brightness(1.1);
                transform: translateY(-1px);
                box-shadow: 0 6px 15px rgba(40, 167, 69, 0.4);
            }
        `;
        document.head.appendChild(style);
    };

    class CustomUIBuilder {
        constructor(config = {}) {
            injectStyles();
            
            this.title = config.title || "Custom UI";
            this.width = config.width || "300px";
            this.elements = [];

            this.container = document.createElement('div');
            this.container.className = 'cub-container';
            this.container.style.width = this.width;

            this.header = document.createElement('div');
            this.header.className = 'cub-header';
            this.header.innerHTML = `<span>${this.title}</span>`;
            
            const closeBtn = document.createElement('span');
            closeBtn.className = 'cub-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = () => this.destroy();
            this.header.appendChild(closeBtn);

            this.content = document.createElement('div');
            this.content.className = 'cub-content';

            this.container.appendChild(this.header);
            this.container.appendChild(this.content);

            this._makeDraggable();
        }

        addInput(opts = {}) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'cub-input';
            input.placeholder = opts.placeholder || '';
            
            this.content.appendChild(input);

            return {
                getValue: () => input.value,
                setValue: (val) => { input.value = val; },
                clear: () => { input.value = ''; }
            };
        }

        addText(opts = {}) {
            const p = document.createElement('p');
            p.className = 'cub-text';
            p.innerText = opts.text || '';
            
            if (opts.hidden) p.style.display = 'none';
            this.content.appendChild(p);

            return {
                setText: (txt) => { p.innerText = txt; },
                show: () => { p.style.display = 'block'; },
                hide: () => { p.style.display = 'none'; }
            };
        }

        addImage(opts = {}) {
            const img = document.createElement('img');
            img.className = 'cub-img';
            if (opts.height) img.style.height = opts.height;
            if (opts.width) img.style.width = opts.width;
            if (opts.hidden) img.style.display = 'none';
            
            this.content.appendChild(img);

            return {
                setSource: (src) => { img.src = src; },
                show: () => { img.style.display = 'block'; },
                hide: () => { img.style.display = 'none'; }
            };
        }

        addButton(opts = {}) {
            const btn = document.createElement('button');
            btn.className = `cub-btn cub-btn-${opts.color || 'blue'}`;
            btn.innerText = opts.text || 'Button';
            
            if (opts.hidden) btn.style.display = 'none';
            if (opts.onClick) btn.addEventListener('click', opts.onClick);

            this.content.appendChild(btn);

            return {
                setText: (txt) => { btn.innerText = txt; },
                show: () => { btn.style.display = 'block'; },
                hide: () => { btn.style.display = 'none'; },
                enable: () => { btn.disabled = false; },
                disable: () => { btn.disabled = true; },
                onClick: (fn) => {
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    newBtn.addEventListener('click', fn);
                }
            };
        }

        render() {
            const existing = document.getElementById(`cub-${this.title.replace(/\s+/g, '-')}`);
            if (existing) existing.remove();
            
            this.container.id = `cub-${this.title.replace(/\s+/g, '-')}`;
            document.body.appendChild(this.container);
        }

        destroy() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }

        _makeDraggable() {
            let isDragging = false;
            let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

            const dragStart = (e) => {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                if (e.target === this.header || e.target.parentNode === this.header) {
                    isDragging = true;
                }
            };

            const dragEnd = () => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                    xOffset = currentX;
                    yOffset = currentY;
                    this.container.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                }
            };

            this.header.addEventListener("mousedown", dragStart, false);
            document.addEventListener("mouseup", dragEnd, false);
            document.addEventListener("mousemove", drag, false);
        }
    }

    global.CustomUIBuilder = CustomUIBuilder;

})(window);
