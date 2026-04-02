(function(global) {
    'use strict';

    const injectStyles = () => {
        if (document.getElementById('custom-ui-builder-styles')) return;
        const style = document.createElement('style');
        style.id = 'custom-ui-builder-styles';
        style.textContent = `
            .cub-container {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #1e1e24;
                color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid #333;
            }
            .cub-header {
                background-color: #2b2b36;
                padding: 10px 15px;
                font-size: 16px;
                font-weight: bold;
                cursor: grab;
                user-select: none;
                border-bottom: 1px solid #444;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cub-header:active {
                cursor: grabbing;
            }
            .cub-close {
                cursor: pointer;
                color: #ff5c5c;
                font-size: 18px;
                line-height: 1;
            }
            .cub-content {
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .cub-input {
                padding: 8px 10px;
                border-radius: 4px;
                border: 1px solid #444;
                background-color: #121216;
                color: #fff;
                outline: none;
            }
            .cub-input:focus {
                border-color: #007bff;
            }
            .cub-text {
                font-size: 14px;
                margin: 0;
                color: #ccc;
            }
            .cub-img {
                border-radius: 6px;
                object-fit: cover;
                align-self: center;
            }
            .cub-btn {
                padding: 8px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
                color: white;
            }
            .cub-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .cub-btn-blue { background-color: #007bff; }
            .cub-btn-blue:hover:not(:disabled) { background-color: #0056b3; }
            .cub-btn-green { background-color: #28a745; }
            .cub-btn-green:hover:not(:disabled) { background-color: #1e7e34; }
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
