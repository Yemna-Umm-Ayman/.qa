/* =========================================
   Umm Ayman Secondary Girls School - Logic
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {

    // ---------- Set current year in footer ----------
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // =====================================================
    // 1. ADD NEWS FUNCTIONALITY
    // =====================================================
    const addNewsBtn = document.getElementById('addNewsBtn');
    const newsList = document.getElementById('newsList');

    if (addNewsBtn && newsList) {
        addNewsBtn.addEventListener('click', function () {
            const newsText = prompt('أدخل نص الخبر الجديد:');
            if (newsText && newsText.trim() !== '') {
                const newItem = document.createElement('div');
                newItem.className = 'news-item';
                newItem.innerHTML = `
                    <span class="news-date">📅 ${new Date().toLocaleDateString('ar-QA')}</span>
                    <p>${escapeHtml(newsText.trim())}</p>
                `;
                newsList.prepend(newItem);
                saveToLocalStorage();
                newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else if (newsText !== null) {
                alert('الرجاء إدخال نص صحيح للخبر.');
            }
        });
    }

    // =====================================================
    // 2. EDIT MODE (Links & Titles)
    // =====================================================
    const editModal    = document.getElementById('editModal');
    const editModeBtn  = document.getElementById('editModeBtn');
    const closeModal   = document.getElementById('closeModal');
    const cancelEdit   = document.getElementById('cancelEdit');
    const saveEdit     = document.getElementById('saveEdit');
    const linksEditor  = document.getElementById('linksEditor');
    const inputSchool  = document.getElementById('inputSchoolName');
    const inputPrincipal = document.getElementById('inputPrincipal');

    // Open modal
    if (editModeBtn) {
        editModeBtn.addEventListener('click', function () {
            buildLinksEditor();
            // Pre-fill current values
            inputSchool.value = document.querySelector('.header-text h1').textContent.trim();
            inputPrincipal.value = document.querySelector('.principal strong').textContent.trim();
            editModal.classList.add('active');
        });
    }

    // Close modal
    function closeEditModal() { editModal.classList.remove('active'); }
    if (closeModal) closeModal.addEventListener('click', closeEditModal);
    if (cancelEdit) cancelEdit.addEventListener('click', closeEditModal);
    if (editModal) {
        editModal.addEventListener('click', function (e) {
            if (e.target === editModal) closeEditModal();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && editModal.classList.contains('active')) closeEditModal();
    });

    // Build the link editor rows
    function buildLinksEditor() {
        linksEditor.innerHTML = '';
        const cards = document.querySelectorAll('.card');
        cards.forEach(function (card, index) {
            const title = card.querySelector('.card-title').textContent.trim();
            const href  = card.getAttribute('href') || '#';
            const key   = card.dataset.key || ('card' + index);

            const row = document.createElement('div');
            row.className = 'link-edit-row';
            row.innerHTML = `
                <label>${escapeHtml(title)}</label>
                <input type="text" class="edit-title" data-key="${key}" value="${escapeAttr(title)}" placeholder="العنوان">
                <input type="text" class="edit-href"  data-key="${key}" value="${escapeAttr(href)}" placeholder="الرابط (https://...)">
            `;
            linksEditor.appendChild(row);
        });
    }

    // Save changes
    if (saveEdit) {
        saveEdit.addEventListener('click', function () {
            // 1. Update school name
            const newSchoolName = inputSchool.value.trim();
            if (newSchoolName) {
                document.querySelector('.header-text h1').textContent = newSchoolName;
            }

            // 2. Update principal
            const newPrincipal = inputPrincipal.value.trim();
            if (newPrincipal) {
                document.querySelector('.principal strong').textContent = newPrincipal;
            }

            // 3. Update each card
            document.querySelectorAll('.edit-title').forEach(function (input) {
                const key = input.dataset.key;
                const card = document.querySelector(`.card[data-key="${key}"]`);
                if (card && input.value.trim()) {
                    card.querySelector('.card-title').textContent = input.value.trim();
                }
            });

            document.querySelectorAll('.edit-href').forEach(function (input) {
                const key = input.dataset.key;
                const card = document.querySelector(`.card[data-key="${key}"]`);
                if (card) {
                    card.setAttribute('href', input.value.trim() || '#');
                }
            });

            saveToLocalStorage();
            closeEditModal();
            showToast('✅ تم حفظ التغييرات بنجاح');
        });
    }

    // =====================================================
    // 3. LOCALSTORAGE PERSISTENCE
    // =====================================================
    function saveToLocalStorage() {
        const data = {
            schoolName: document.querySelector('.header-text h1').textContent.trim(),
            principal:  document.querySelector('.principal strong').textContent.trim(),
            links:      {},
            news:       []
        };

        document.querySelectorAll('.card').forEach(function (card) {
            const key = card.dataset.key;
            if (key) {
                data.links[key] = {
                    title: card.querySelector('.card-title').textContent.trim(),
                    href:  card.getAttribute('href')
                };
            }
        });

        document.querySelectorAll('#newsList .news-item').forEach(function (item) {
            data.news.push({
                date: item.querySelector('.news-date')?.textContent || '',
                text: item.querySelector('p')?.textContent || ''
            });
        });

        try {
            localStorage.setItem('ummAymanSchoolData', JSON.stringify(data));
        } catch (e) { /* storage might be full / disabled */ }
    }

    function loadFromLocalStorage() {
        let data;
        try {
            const raw = localStorage.getItem('ummAymanSchoolData');
            if (!raw) return;
            data = JSON.parse(raw);
        } catch (e) { return; }

        if (data.schoolName) {
            document.querySelector('.header-text h1').textContent = data.schoolName;
        }
        if (data.principal) {
            document.querySelector('.principal strong').textContent = data.principal;
        }
        if (data.links) {
            Object.keys(data.links).forEach(function (key) {
                const card = document.querySelector(`.card[data-key="${key}"]`);
                if (card) {
                    card.querySelector('.card-title').textContent = data.links[key].title;
                    card.setAttribute('href', data.links[key].href);
                }
            });
        }
        if (data.news && data.news.length) {
            newsList.innerHTML = '';
            data.news.forEach(function (n) {
                const item = document.createElement('div');
                item.className = 'news-item';
                item.innerHTML = `
                    <span class="news-date">${escapeHtml(n.date)}</span>
                    <p>${escapeHtml(n.text)}</p>
                `;
                newsList.appendChild(item);
            });
        }
    }

    loadFromLocalStorage();

    // =====================================================
    // 4. HELPERS
    // =====================================================
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttr(str) {
        return escapeHtml(str);
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, #6A1B9A, #E91E63); color: #fff;
            padding: 12px 26px; border-radius: 10px; font-family: inherit;
            font-weight: 700; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            animation: toastIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s';
            setTimeout(function () { toast.remove(); }, 400);
        }, 2200);
    }

    // Add
