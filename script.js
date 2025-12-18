// Global variable untuk signature
let signatureDataURL = '';

// Variable untuk invoice counters
let invoiceCounters = {}; // Format: { "2024-01-15": 5, "2024-01-16": 2 }

// Data SOW dengan harga default
const SOW_OPTIONS = [
    { name: "VT free mirroring IG Reels", price: 29700000 },
    { name: "Video Tiktok", price: 30000000 },
    { name: "Tiktok story video", price: 5000000 },
    { name: "Tiktok story foto", price: 3000000 },
    { name: "Tiktok foto feed", price: 3000000 },
    { name: "Tiktok foto carousel", price: 500000, unit: "FOTO" },
    { name: "Video Reels", price: 27000000 },
    { name: "Instagram story video", price: 3500000 },
    { name: "Instagram story foto", price: 2500000 },
    { name: "Instagram paid promote", price: 2000000 },
    { name: "Instagram feed foto", price: 2500000 },
    { name: "Instagram carousel foto", price: 500000, unit: "FOTO" },
    { name: "Instagram session story", price: 10000000, unit: "3 STORY" },
    { name: "Youtube short", price: 10000000 },
    { name: "Tab link", price: 500000 },
    { name: "Link product on bio", price: 1000000 },
    { name: "Tag collaboration", price: 500000 },
    { name: "Tag brand user id", price: 500000 },
    { name: "Visit transportation fee Jabodetabek", price: 3000000 },
    { name: "Visit transportation fee Bandung", price: 4000000 },
    { name: "Visit transportation fee Bali & Remote city", price: 10000000 },
    { name: "Talent shoot foto", price: 11000000 },
    { name: "Talent shoot video", price: 15000000 },
    { name: "Live shopping host", price: 5500000, unit: "HOUR" },
    { name: "Baby udon in frame", price: 10000000 },
    { name: "Guest speaker", price: 11000000 },
    { name: "Exclusive 1 month", price: 25000000 },
    { name: "Boost ads", price: 1000000 },
    { name: "Owning Video content", price: 5000000 },
    { name: "Brand ambassador", price: 0, custom: true }
];

// Function untuk format tanggal Indonesia
function formatDateIndonesian(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Format number dengan thousand separators
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

// Function to show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animation for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ========== COUNTER MANAGEMENT ==========

// Load saved counters dari localStorage
function loadInvoiceCounters() {
    const saved = localStorage.getItem('invoiceCounters');
    if (saved) {
        invoiceCounters = JSON.parse(saved);
    } else {
        invoiceCounters = {};
    }
}

// Save counters ke localStorage
function saveInvoiceCounters() {
    localStorage.setItem('invoiceCounters', JSON.stringify(invoiceCounters));
}

// Cek dan reset untuk hari baru
function checkAndResetForNewDay() {
    const today = new Date().toISOString().split('T')[0];
    const lastSystemDate = localStorage.getItem('lastSystemDate');

    // Jika hari baru (atau belum pernah set lastSystemDate)
    if (!lastSystemDate || lastSystemDate < today) {
        // Pastikan counter untuk hari ini ada (default 1)
        if (invoiceCounters[today] === undefined) {
            invoiceCounters[today] = 1; // ⬅️ MULAI DARI 1
        }

        saveInvoiceCounters();
    }

    // Update lastSystemDate
    localStorage.setItem('lastSystemDate', today);
}

// Get counter untuk tanggal tertentu
function getCounterForDate(dateString) {
    if (!dateString || dateString === '') {
        dateString = new Date().toISOString().split('T')[0];
    }

    const today = new Date().toISOString().split('T')[0];

    // Initialize jika belum ada counter untuk tanggal ini
    if (invoiceCounters[dateString] === undefined) {
        // Jika tanggal = hari ini
        if (dateString === today) {
            // Cek apakah ada counter untuk hari ini
            const lastSystemDate = localStorage.getItem('lastSystemDate') || '';

            // Jika hari baru atau belum pernah set
            if (!lastSystemDate || lastSystemDate < today) {
                invoiceCounters[today] = 1; // ⬅️ MULAI DARI 1
            } else {
                // Masih hari yang sama, lanjut counter yang ada
                invoiceCounters[today] = invoiceCounters[today] || 1; // ⬅️ DEFAULT 1
            }
        }
        // Jika tanggal di masa depan
        else if (dateString > today) {
            invoiceCounters[dateString] = 1; // ⬅️ MULAI DARI 1
        }
        // Jika tanggal di masa lalu
        else {
            // Cari counter terakhir sebelum tanggal ini
            const dates = Object.keys(invoiceCounters).sort();
            let foundCounter = 1; // ⬅️ DEFAULT 1

            for (let i = dates.length - 1; i >= 0; i--) {
                if (dates[i] <= dateString) {
                    foundCounter = invoiceCounters[dates[i]];
                    break;
                }
            }

            invoiceCounters[dateString] = foundCounter;
        }

        saveInvoiceCounters();
    }

    return invoiceCounters[dateString];
}

// Generate invoice number dengan counter
function generateInvoiceNumber(shouldIncrement = false) {
    const dateInput = document.getElementById('invoiceDate').value;
    const invoiceDate = dateInput || new Date().toISOString().split('T')[0];

    // Get current counter untuk tanggal ini
    let counter = getCounterForDate(invoiceDate);

    // Hanya increment jika shouldIncrement = true (saat download)
    if (shouldIncrement) {
        // Simpan counter yang akan digunakan (sebelum increment untuk next time)
        const currentCounter = counter;

        // Increment untuk next invoice
        counter++;
        invoiceCounters[invoiceDate] = counter;

        // Update lastSystemDate ke hari ini
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('lastSystemDate', today);

        saveInvoiceCounters();

        // Gunakan counter yang sebelumnya untuk invoice ini
        counter = currentCounter;
    }

    // Format invoice number
    const year = invoiceDate.substring(0, 4);
    const month = invoiceDate.substring(5, 7);
    const day = invoiceDate.substring(8, 10);
    const companyCode = "RSC";
    const formattedCounter = String(counter).padStart(3, '0');

    const invoiceNumber = `${companyCode}/INV/${year}${month}${day}/${formattedCounter}`;
    document.getElementById('invoiceNumber').value = invoiceNumber;

    return invoiceNumber;
}

// Reset semua counters (optional, untuk debugging)
function resetAllCounters() {
    if (confirm('Reset all invoice counters? This will delete all counter history.')) {
        invoiceCounters = {};
        localStorage.removeItem('invoiceCounters');
        localStorage.removeItem('lastSystemDate');

        // Generate ulang dengan counter 1
        generateInvoiceNumber(false);
        previewInvoice();

        showNotification('All invoice counters have been reset.');
    }
}

// ========== END COUNTER MANAGEMENT ==========

// ========== AUTO-SAVE FORM SYSTEM ==========

// Debounce function untuk optimize performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Save semua form data ke localStorage
function saveFormData() {
    try {
        const formData = {
            // Company info
            companyName: document.getElementById('companyName').value,
            companyAddress: document.getElementById('companyAddress').value,

            // Client info
            clientName: document.getElementById('clientName').value,
            clientAddress: document.getElementById('clientAddress').value,
            clientCity: document.getElementById('clientCity').value,

            // Invoice details
            invoiceNumber: document.getElementById('invoiceNumber').value,
            invoiceDate: document.getElementById('invoiceDate').value,

            // Payment info
            npwp: document.getElementById('npwp').value,
            bankBranch: document.getElementById('bankBranch').value,
            accountNumber: document.getElementById('accountNumber').value,
            accountName: document.getElementById('accountName').value,
            phoneNumber: document.getElementById('phoneNumber').value,

            // Additional info
            discountAmount: document.getElementById('discountAmount').value,
            taxPercent: document.getElementById('taxPercent').value,
            signatoryName: document.getElementById('signatoryName').value,
            signatoryTitle: document.getElementById('signatoryTitle').value,

            // Items data
            items: getItemsData(),

            // Signature
            signatureDataURL: signatureDataURL
        };

        localStorage.setItem('invoiceFormData', JSON.stringify(formData));
        console.log('Form data saved');
    } catch (error) {
        console.error('Error saving form data:', error);
    }
}

// Get items data untuk disimpan
function getItemsData() {
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const dropdown = row.querySelector('.item-sow-dropdown');
        const customInput = row.querySelector('.item-name');
        const description = row.querySelector('.item-description');
        const qty = row.querySelector('.item-qty');
        const price = row.querySelector('.item-price');
        const grossup = row.querySelector('.item-grossup');

        let sowValue = '';
        let customName = '';
        let isCustom = false;

        // Cek apakah ini custom item
        if (customInput && customInput.style.display !== 'none' && customInput.value) {
            // Ini custom item
            sowValue = 'custom|';
            customName = customInput.value;
            isCustom = true;
        } else if (dropdown) {
            // Ini Select2 item
            sowValue = $(dropdown).val() || dropdown.value;
            // Get custom name dari hidden input
            if (customInput) {
                customName = customInput.value;
            }
        }

        const item = {
            sowValue: sowValue,
            customName: customName,
            isCustom: isCustom,
            description: description ? description.value : '',
            qty: qty ? qty.value : '1',
            price: price ? price.value : '0',
            grossup: grossup ? grossup.value : '0',
            select2Value: dropdown ? $(dropdown).val() : ''
        };
        items.push(item);
    });
    return items;
}

// Load form data dari localStorage
function loadFormData() {
    const saved = localStorage.getItem('invoiceFormData');
    if (!saved) return;

    try {
        const formData = JSON.parse(saved);

        // Load basic form fields
        if (formData.companyName) document.getElementById('companyName').value = formData.companyName;
        if (formData.companyAddress) document.getElementById('companyAddress').value = formData.companyAddress;
        if (formData.clientName) document.getElementById('clientName').value = formData.clientName;
        if (formData.clientAddress) document.getElementById('clientAddress').value = formData.clientAddress;
        if (formData.clientCity) document.getElementById('clientCity').value = formData.clientCity;
        if (formData.invoiceNumber) document.getElementById('invoiceNumber').value = formData.invoiceNumber;
        if (formData.invoiceDate) document.getElementById('invoiceDate').value = formData.invoiceDate;
        if (formData.npwp) document.getElementById('npwp').value = formData.npwp;
        if (formData.bankBranch) document.getElementById('bankBranch').value = formData.bankBranch;
        if (formData.accountNumber) document.getElementById('accountNumber').value = formData.accountNumber;
        if (formData.accountName) document.getElementById('accountName').value = formData.accountName;
        if (formData.phoneNumber) document.getElementById('phoneNumber').value = formData.phoneNumber;
        if (formData.discountAmount) document.getElementById('discountAmount').value = formData.discountAmount;
        if (formData.taxPercent) document.getElementById('taxPercent').value = formData.taxPercent;
        if (formData.signatoryName) document.getElementById('signatoryName').value = formData.signatoryName;
        if (formData.signatoryTitle) document.getElementById('signatoryTitle').value = formData.signatoryTitle;

        // Load signature
        if (formData.signatureDataURL) {
            signatureDataURL = formData.signatureDataURL;
            document.getElementById('signatureImage').src = signatureDataURL;
            document.getElementById('signaturePreview').style.display = 'block';
        }

        // Simpan items data untuk diload nanti (setelah Select2 initialized)
        if (formData.items && formData.items.length > 0) {
            window.pendingItemsData = formData.items;
        }

        console.log('Form data loaded from localStorage');

    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

// Load saved items setelah semua di-setup
function loadSavedItems() {
    if (!window.pendingItemsData || !Array.isArray(window.pendingItemsData)) return;

    const itemsData = window.pendingItemsData;
    console.log('Loading saved items:', itemsData.length, 'items');

    // Hapus SEMUA item yang ada (clear container)
    const itemsContainer = document.getElementById('itemsContainer');
    const existingItems = itemsContainer.querySelectorAll('.item-row');

    // Destroy semua Select2 instances
    existingItems.forEach(item => {
        const dropdown = item.querySelector('.item-sow-dropdown');
        if (dropdown && $(dropdown).hasClass('select2-hidden-accessible')) {
            $(dropdown).select2('destroy');
        }
    });

    // Hapus semua items
    itemsContainer.innerHTML = '';

    // Buat items berdasarkan saved data
    itemsData.forEach((itemData, index) => {
        // Create new item
        const newItem = document.createElement('div');
        newItem.className = 'item-row';
        newItem.innerHTML = `
            <select class="item-sow-dropdown">
                <option value="">Select Scope of Work</option>
            </select>
            
            <input type="text" placeholder="Custom Scope of Work" class="item-name" style="display: none;">
            
            <input type="text" placeholder="Description" class="item-description" value="">
            
            <input type="number" placeholder="QTY" class="item-qty" value="1" min="1">
            
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" placeholder="Unit Price" class="item-price" value="0" style="flex: 1;">
                <input type="number" placeholder="Gross Up %" class="item-grossup" value="0" min="0" max="1000" 
                       style="width: 80px;" title="Percentage of price increase">
            </div>
            
            <button type="button" onclick="removeItem(this)" class="remove-btn">×</button>
        `;

        itemsContainer.appendChild(newItem);

        // Populate dropdown
        const dropdown = newItem.querySelector('.item-sow-dropdown');
        populateSOWDropdown(dropdown);

        // Initialize Select2 untuk item ini
        setTimeout(() => {
            initializeSelect2(dropdown);

            // Set values setelah Select2 initialized
            setTimeout(() => {
                // Get elements
                const nameInput = newItem.querySelector('.item-name');
                const descInput = newItem.querySelector('.item-description');
                const qtyInput = newItem.querySelector('.item-qty');
                const priceInput = newItem.querySelector('.item-price');
                const grossupInput = newItem.querySelector('.item-grossup');

                // Set basic values
                if (descInput) descInput.value = itemData.description || '';
                if (qtyInput) qtyInput.value = itemData.qty || '1';
                if (priceInput) priceInput.value = itemData.price || '0';
                if (grossupInput) grossupInput.value = itemData.grossup || '0';

                // Handle custom vs Select2 item
                if (itemData.isCustom && nameInput) {
                    // Ini custom item
                    nameInput.style.display = 'block';
                    nameInput.value = itemData.customName || '';

                    // Set Select2 ke custom
                    $(dropdown).val('custom|').trigger('change');
                    $(dropdown).next('.select2-container').hide();

                } else if (dropdown && itemData.select2Value) {
                    // Ini Select2 item
                    if (nameInput) {
                        nameInput.style.display = 'none';
                        nameInput.value = itemData.customName || '';
                    }

                    // Set Select2 value
                    $(dropdown).val(itemData.select2Value).trigger('change');
                }

                // Add event listeners untuk input ini
                const priceInputEl = newItem.querySelector('.item-price');
                const grossUpInputEl = newItem.querySelector('.item-grossup');
                const qtyInputEl = newItem.querySelector('.item-qty');
                const customInputEl = newItem.querySelector('.item-name');
                const descInputEl = newItem.querySelector('.item-description');

                if (priceInputEl) {
                    priceInputEl.addEventListener('input', () => {
                        calculateItemFinalPrice(newItem);
                        previewInvoice();
                        saveFormData();
                    });
                }

                if (grossUpInputEl) {
                    grossUpInputEl.addEventListener('input', () => {
                        calculateItemFinalPrice(newItem);
                        previewInvoice();
                        saveFormData();
                    });
                }

                if (qtyInputEl) {
                    qtyInputEl.addEventListener('input', () => {
                        previewInvoice();
                        saveFormData();
                    });
                }

                if (descInputEl) {
                    descInputEl.addEventListener('input', debounce(saveFormData, 500));
                }

                if (customInputEl) {
                    customInputEl.addEventListener('input', debounce(saveFormData, 500));
                    customInputEl.addEventListener('focus', () => {
                        $(dropdown).val('custom|').trigger('change');
                    });
                }

                // Update gross up visual
                calculateItemFinalPrice(newItem);

            }, 100);

        }, 50 * (index + 1));
    });

    // Clear pending data
    window.pendingItemsData = null;

    // Update preview setelah semua items loaded
    setTimeout(() => {
        previewInvoice();
        saveFormData(); // Save ulang setelah load
        console.log('All items loaded successfully');
    }, 500 + (itemsData.length * 100));
}

// Setup auto-save listeners
function setupAutoSave() {
    // List semua input yang mau di-save
    const inputsToSave = [
        'companyName', 'companyAddress',
        'clientName', 'clientAddress', 'clientCity',
        'invoiceNumber', 'invoiceDate',
        'npwp', 'bankBranch', 'accountNumber', 'accountName', 'phoneNumber',
        'discountAmount', 'taxPercent', 'signatoryName', 'signatoryTitle'
    ];

    // Add event listeners untuk semua input
    inputsToSave.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', debounce(saveFormData, 500));
            element.addEventListener('change', debounce(saveFormData, 500));
        }
    });

    // Add event listeners untuk items input
    document.addEventListener('input', function(e) {
        if (e.target.matches('.item-description, .item-qty, .item-price, .item-grossup, .item-name')) {
            debounce(saveFormData, 500)();
        }
    });

    // Untuk Select2 changes
    $(document).on('select2:select', '.item-sow-dropdown', debounce(saveFormData, 500));

    // Untuk button add/remove item
    document.addEventListener('click', function(e) {
        if (e.target.matches('.remove-btn') ||
            (e.target.closest('h2') && e.target.closest('h2').querySelector('button') === e.target)) {
            setTimeout(saveFormData, 100);
        }
    });

    // Save saat signature di-upload/hapus
    document.getElementById('signatureUpload').addEventListener('change', function() {
        setTimeout(saveFormData, 1000);
    });

    // Juga save saat page di-unload
    window.addEventListener('beforeunload', saveFormData);
}

// Clear semua form data
function clearFormData() {
    if (confirm('Clear all form data? This will remove all saved inputs but keep invoice counters.')) {
        // Hapus form data dari localStorage
        localStorage.removeItem('invoiceFormData');

        // Reset signature
        signatureDataURL = '';
        document.getElementById('signatureUpload').value = '';
        document.getElementById('signaturePreview').style.display = 'none';

        // Reset form fields ke default values
        document.getElementById('companyName').value = 'CV RIEKI SENOKU CREATIVE';
        document.getElementById('companyAddress').value = 'Jakarta Selatan - Indonesia';
        document.getElementById('clientName').value = 'PT ISM BOGASARI FLOUR JAKARTA';
        document.getElementById('clientAddress').value = 'Jl. Raya Clinchip, Tanjung Priok';
        document.getElementById('clientCity').value = 'Jakarta Utara - 14110';
        document.getElementById('npwp').value = '1000 0000 0720 7103';
        document.getElementById('bankBranch').value = 'OCBC - Cabang OCBC Tower';
        document.getElementById('accountNumber').value = '545800120135';
        document.getElementById('accountName').value = 'CV Rieki Senoku Creative';
        document.getElementById('phoneNumber').value = '0812360111';
        document.getElementById('discountAmount').value = '0';
        document.getElementById('taxPercent').value = '0';
        document.getElementById('signatoryName').value = 'Sherly Fanny Heriyanti';
        document.getElementById('signatoryTitle').value = 'CEO';

        // Set tanggal ke hari ini
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = formattedDate;

        // Regenerate invoice number
        generateInvoiceNumber(false);

        // Clear semua items kecuali satu
        const itemsContainer = document.getElementById('itemsContainer');
        const items = itemsContainer.querySelectorAll('.item-row');

        // Destroy Select2 instances
        items.forEach((item, index) => {
            if (index > 0) {
                const dropdown = item.querySelector('.item-sow-dropdown');
                if (dropdown && $(dropdown).hasClass('select2-hidden-accessible')) {
                    $(dropdown).select2('destroy');
                }
            }
        });

        // Hapus semua items kecuali pertama
        while (itemsContainer.children.length > 1) {
            itemsContainer.removeChild(itemsContainer.lastChild);
        }

        // Reset item pertama
        const firstItem = itemsContainer.querySelector('.item-row');
        if (firstItem) {
            const nameInput = firstItem.querySelector('.item-name');
            const descInput = firstItem.querySelector('.item-description');
            const qtyInput = firstItem.querySelector('.item-qty');
            const priceInput = firstItem.querySelector('.item-price');
            const grossupInput = firstItem.querySelector('.item-grossup');
            const dropdown = firstItem.querySelector('.item-sow-dropdown');

            if (nameInput) {
                nameInput.style.display = 'none';
                nameInput.value = '';
            }
            if (descInput) descInput.value = '';
            if (qtyInput) qtyInput.value = '1';
            if (priceInput) priceInput.value = '0';
            if (grossupInput) grossupInput.value = '0';

            // Reset Select2
            if (dropdown) {
                setTimeout(() => {
                    $(dropdown).val('').trigger('change');
                    const defaultSOW = SOW_OPTIONS.find(s => s.name === "Tiktok");
                    if (defaultSOW) {
                        $(dropdown).val(`${defaultSOW.name}|${defaultSOW.price}`).trigger('change');
                    }
                }, 100);
            }
        }

        // Update preview
        setTimeout(() => {
            previewInvoice();
            showNotification('Form cleared successfully!');
        }, 300);
    }
}

// ========== END AUTO-SAVE FORM SYSTEM ==========

// ========== SELECT2 FUNCTIONS ==========

// Function untuk initialize Select2
function initializeSelect2(dropdown) {
    $(dropdown).select2({
        placeholder: 'Select Scope of Work',
        allowClear: false,
        width: '100%',
        dropdownParent: $('#itemsContainer'),
        templateResult: formatSOWOption,
        templateSelection: formatSOWSelection
    }).on('select2:select', function(e) {
        selectSOW(this);
    });
}

// Format tampilan option di dropdown
function formatSOWOption(state) {
    if (!state.id) {
        return state.text;
    }

    // Cari data SOW berdasarkan nama
    const sowName = state.text.split(' - ')[0];
    const sowData = SOW_OPTIONS.find(s => s.name === sowName);

    if (sowData) {
        const $option = $(`
            <div class="select2-custom-option">
                <span class="sow-name">${sowData.name}</span>
                <span class="sow-price">${formatNumber(sowData.price)}${sowData.unit ? '/' + sowData.unit : ''}</span>
            </div>
        `);
        return $option;
    }
    return state.text;
}

// Format tampilan yang dipilih
function formatSOWSelection(state) {
    if (!state.id) return state.text;
    const sowName = state.text.split(' - ')[0];
    return sowName;
}

// ========== END SELECT2 FUNCTIONS ==========

// Handle signature upload
function handleSignatureUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) {
        alert('Only image files are allowed!');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        alert('Maximum file size 2MB!');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        signatureDataURL = event.target.result;
        document.getElementById('signatureImage').src = signatureDataURL;
        document.getElementById('signaturePreview').style.display = 'block';
        previewInvoice();
        saveFormData();
    };
    reader.readAsDataURL(file);
}

// Fungsi untuk hapus signature
function removeSignature() {
    signatureDataURL = '';
    document.getElementById('signatureUpload').value = '';
    document.getElementById('signaturePreview').style.display = 'none';
    previewInvoice();
    saveFormData();
}

// Function untuk populate dropdown SOW
function populateSOWDropdown(dropdown) {
    // Clear existing options kecuali yang pertama
    while (dropdown.options.length > 1) {
        dropdown.remove(1);
    }

    // Add SOW options
    SOW_OPTIONS.forEach(sow => {
        const option = document.createElement('option');
        let displayText = sow.name;

        // Format harga untuk display
        if (sow.price > 0) {
            const formattedPrice = formatNumber(sow.price);
            if (sow.unit) {
                displayText += ` - ${formattedPrice}/${sow.unit}`;
            } else {
                displayText += ` - ${formattedPrice}`;
            }
        } else if (sow.custom) {
            displayText += ` - Custom Price`;
        }

        option.text = displayText;
        option.value = `${sow.name}|${sow.price}`;
        dropdown.add(option);
    });

    // Add custom option
    const customOption = document.createElement('option');
    customOption.text = "Custom Item - Set your own price";
    customOption.value = "custom|";
    dropdown.add(customOption);
}

// Function untuk handle SOW selection dengan Select2
function selectSOW(selectElement) {
    const row = selectElement.closest('.item-row');
    const selectedValue = $(selectElement).val();

    if (!selectedValue) return;

    const [sowName, sowPrice] = selectedValue.split('|');
    const customInput = row.querySelector('.item-name');
    const select2Container = $(selectElement).next('.select2-container');

    if (sowName === 'custom') {
        // Show custom input, hide Select2
        customInput.style.display = 'block';
        select2Container.hide();
        customInput.value = '';
        customInput.focus();

        // Reset price dan description
        row.querySelector('.item-price').value = '';
        row.querySelector('.item-description').value = '';
    } else {
        // Hide custom input, show Select2
        customInput.style.display = 'none';
        select2Container.show();

        // Set SOW name di custom input (hidden)
        customInput.value = sowName;

        // Set price
        const price = parseFloat(sowPrice) || 0;
        row.querySelector('.item-price').value = price;

        // Kosongkan description (manual input)
        const descInput = row.querySelector('.item-description');
        descInput.value = '';
    }

    // Hitung gross up
    calculateItemFinalPrice(row);
    previewInvoice();
    saveFormData();
}

// Function untuk calculate final price dengan gross up
function calculateItemFinalPrice(row) {
    const priceInput = row.querySelector('.item-price');
    const grossUpInput = row.querySelector('.item-grossup');
    const basePrice = parseFloat(priceInput.value) || 0;
    const grossUpPercent = parseFloat(grossUpInput.value) || 0;

    // Calculate final price dengan gross up
    const finalPrice = basePrice * (1 + grossUpPercent / 100);

    // Tampilkan indikator visual untuk gross up di form
    if (grossUpPercent > 0) {
        priceInput.style.borderColor = '#ff9800';
        priceInput.style.backgroundColor = '#fff8e1';
        grossUpInput.style.borderColor = '#ff9800';
        grossUpInput.style.backgroundColor = grossUpPercent > 0 ? '#fff8e1' : 'white';
    } else {
        priceInput.style.borderColor = '#ddd';
        priceInput.style.backgroundColor = 'white';
        grossUpInput.style.borderColor = '#ddd';
        grossUpInput.style.backgroundColor = grossUpPercent > 0 ? '#fff8e1' : 'white';
    }

    return finalPrice;
}

// Add item dengan Select2
function addItem() {
    const container = document.getElementById('itemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <select class="item-sow-dropdown">
            <option value="">Select Scope of Work</option>
        </select>
        
        <input type="text" placeholder="Custom Scope of Work" class="item-name" style="display: none;">
        
        <input type="text" placeholder="Description" class="item-description" value="">
        
        <input type="number" placeholder="QTY" class="item-qty" value="1" min="1">
        
        <div style="display: flex; gap: 10px; align-items: center;">
            <input type="number" placeholder="Unit Price" class="item-price" value="0" style="flex: 1;">
            <input type="number" placeholder="Gross Up %" class="item-grossup" value="0" min="0" max="1000" 
                   style="width: 80px;" title="Percentage of price increase">
        </div>
        
        <button type="button" onclick="removeItem(this)" class="remove-btn">×</button>
    `;

    container.appendChild(newItem);

    // Populate dropdown untuk item baru
    const dropdown = newItem.querySelector('.item-sow-dropdown');
    populateSOWDropdown(dropdown);

    // Initialize Select2 untuk dropdown baru
    setTimeout(() => {
        initializeSelect2(dropdown);

        // Add event listeners untuk input
        const priceInput = newItem.querySelector('.item-price');
        const grossUpInput = newItem.querySelector('.item-grossup');
        const qtyInput = newItem.querySelector('.item-qty');
        const customInput = newItem.querySelector('.item-name');
        const descInput = newItem.querySelector('.item-description');

        priceInput.addEventListener('input', () => {
            calculateItemFinalPrice(newItem);
            previewInvoice();
            saveFormData();
        });

        grossUpInput.addEventListener('input', () => {
            calculateItemFinalPrice(newItem);
            previewInvoice();
            saveFormData();
        });

        qtyInput.addEventListener('input', () => {
            previewInvoice();
            saveFormData();
        });

        descInput.addEventListener('input', debounce(saveFormData, 500));

        // Jika custom input di-focus, set Select2 ke custom option
        customInput.addEventListener('focus', () => {
            $(dropdown).val('custom|').trigger('change');
        });

        // Auto-save saat custom input diisi
        customInput.addEventListener('input', debounce(saveFormData, 500));

    }, 100);

    // Auto-save setelah add item
    setTimeout(saveFormData, 200);
}

// Remove item
function removeItem(button) {
    if (document.querySelectorAll('.item-row').length > 1) {
        // Destroy Select2 instance sebelum remove
        const dropdown = button.closest('.item-row').querySelector('.item-sow-dropdown');
        if (dropdown && $(dropdown).hasClass('select2-hidden-accessible')) {
            $(dropdown).select2('destroy');
        }
        button.closest('.item-row').remove();
        previewInvoice();
        saveFormData();
    } else {
        alert("At least 1 item is required!");
    }
}

// Calculate totals dengan gross up
function calculateTotals() {
    let subtotal = 0;
    let itemsData = [];

    document.querySelectorAll('.item-row').forEach(item => {
        const nameInput = item.querySelector('.item-name');
        const dropdown = item.querySelector('.item-sow-dropdown');
        let name = '';

        if (nameInput.style.display !== 'none' && nameInput.value) {
            name = nameInput.value;
        } else if (dropdown.value) {
            const selectedValue = $(dropdown).val() || dropdown.value;
            if (selectedValue) {
                const [sowName, _] = selectedValue.split('|');
                if (sowName !== 'custom') {
                    name = sowName;
                }
            }
        }

        const description = item.querySelector('.item-description').value || '';
        const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
        const basePrice = parseFloat(item.querySelector('.item-price').value) || 0;
        const grossUpPercent = parseFloat(item.querySelector('.item-grossup').value) || 0;

        const finalPrice = basePrice * (1 + grossUpPercent / 100);
        const total = qty * finalPrice;
        subtotal += total;

        itemsData.push({
            name,
            description,
            qty,
            finalPrice,
            total
        });
    });

    const discount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const afterDiscount = subtotal - discount;

    const taxPercent = parseFloat(document.getElementById('taxPercent').value) || 0;
    const tax = afterDiscount * (taxPercent / 100);
    const grandTotal = afterDiscount + tax;

    return { itemsData, subtotal, discount, afterDiscount, tax, grandTotal };
}

// Preview Invoice
function previewInvoice() {
    const preview = document.getElementById('invoicePreview');
    const { itemsData, subtotal, discount, afterDiscount, tax, grandTotal } = calculateTotals();

    // Build items table
    let itemsHTML = '';
    itemsData.forEach((item, index) => {
        itemsHTML += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 8px; text-align: center; width: 5%;">${index + 1}</td>
                <td style="padding: 10px 8px; width: 25%; font-weight: bold;">${item.name}</td>
                <td style="padding: 10px 8px; width: 20%;">${item.description}</td>
                <td style="padding: 10px 8px; text-align: center; width: 10%;">${item.qty}</td>
                <td style="padding: 10px 8px; text-align: right; width: 15%;">${formatNumber(item.finalPrice)}</td>
                <td style="padding: 10px 8px; text-align: right; width: 15%; font-weight: bold;">${formatNumber(item.total)}</td>
            </tr>
        `;
    });

    // LOGIKA: Hide semua intermediate kalo discount = 0 dan tax = 0
    let totalsHTML = '';

    if (discount === 0 && tax === 0) {
        totalsHTML = `
            <tr style="background-color: #f0f0f0; border-top: 2px solid #000; border-bottom: 2px solid #000;">
                <td colspan="5" style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">Grand Total</td>
                <td style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">${formatNumber(grandTotal)}</td>
            </tr>
        `;
    } else {
        if (discount > 0 || tax > 0) {
            totalsHTML += `
                <tr style="border-top: 2px solid #000;">
                    <td colspan="5" style="padding: 12px 8px; text-align: right; font-weight: bold;">Sub Total</td>
                    <td style="padding: 12px 8px; text-align: right; font-weight: bold;">
                        ${formatNumber(subtotal)}
                    </td>
                </tr>
            `;
        }

        if (discount > 0) {
            totalsHTML += `
                <tr>
                    <td colspan="5" style="padding: 10px 8px; text-align: right; font-weight: bold; color: #d32f2f;">
                        Discount
                    </td>
                    <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #d32f2f;">
                        -${formatNumber(discount)}
                    </td>
                </tr>
            `;
        }

        if (tax > 0) {
            totalsHTML += `
                <tr>
                    <td colspan="5" style="padding: 10px 8px; text-align: right; font-weight: bold;">PPH</td>
                    <td style="padding: 10px 8px; text-align: right; font-weight: bold;">
                        ${formatNumber(tax)}
                    </td>
                </tr>
            `;
        }

        totalsHTML += `
            <tr style="background-color: #f0f0f0;">
                <td colspan="5" style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">
                    Grand Total
                </td>
                <td style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">
                    ${formatNumber(grandTotal)}
                </td>
            </tr>
        `;

        if (tax > 0) {
            const netPayment = grandTotal - tax;
            totalsHTML += `
                <tr style="background-color: #e8f5e9; border-bottom: 2px solid #000;">
                    <td colspan="5" style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">
                        Net Payment
                    </td>
                    <td style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">
                        ${formatNumber(netPayment)}
                    </td>
                </tr>
            `;
        }
    }

    itemsHTML += totalsHTML;

    // Cek apakah bank info kosong
    const npwp = document.getElementById('npwp').value.trim();
    const bankBranch = document.getElementById('bankBranch').value.trim();
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const accountName = document.getElementById('accountName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();

    const hasBankInfo = npwp || bankBranch || accountNumber || accountName || phoneNumber;

    // Generate bank info HTML jika ada data
    let bankInfoHTML = '';
    if (hasBankInfo) {
        bankInfoHTML = `
            <div style="margin-bottom: 40px; font-size: 10pt;">
                <div style="font-weight: bold; margin-bottom: 8px;">
                    Payment Information
                </div>

                ${npwp ? `<div>NPWP : ${npwp}</div>` : ''}
                ${bankBranch ? `<div>Bank & Branch : ${bankBranch}</div>` : ''}
                ${accountNumber ? `<div>Account Number : ${accountNumber}</div>` : ''}
                ${accountName ? `<div>Account Name : ${accountName}</div>` : ''}
                ${phoneNumber ? `<div>Phone Number : ${phoneNumber}</div>` : ''}
            </div>
        `;
    }

    // Generate signature HTML
    let signatureHTML = '';
    if (signatureDataURL) {
        signatureHTML = `
            <div style="display: inline-block; text-align: center; width: 300px;">
                <div style="margin-bottom: 20px;"></div>
                <img src="${signatureDataURL}" style="max-width: 250px; max-height: 100px; margin-bottom: 10px;" alt="Signature">
                <div style="font-weight: bold; margin-top: 5px;">
                    ${document.getElementById('signatoryName').value}
                </div>
                <div>${document.getElementById('signatoryTitle').value}</div>
            </div>
        `;
    } else {
        signatureHTML = `
            <div style="display: inline-block; text-align: center; width: 300px;">
                <div style="margin-bottom: 80px;"></div>
                <div style="font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 80px;">
                    ( ${document.getElementById('signatoryName').value} )
                </div>
                <div>${document.getElementById('signatoryTitle').value}</div>
            </div>
        `;
    }

    // Get current counter info untuk display
    const dateInput = document.getElementById('invoiceDate').value;
    const invoiceDate = dateInput || new Date().toISOString().split('T')[0];
    const currentCounter = getCounterForDate(invoiceDate);
    const nextCounter = currentCounter; // Counter untuk invoice ini
    const formattedCounter = String(nextCounter).padStart(3, '0');
    const nextInvoiceNumber = `RSC/INV/${invoiceDate.replace(/-/g, '')}/${formattedCounter}`;

    preview.innerHTML = `
        <div id="pdfContent" style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; max-width: 900px; margin: 0 auto;">
            <!-- Counter Info (Hanya di Preview) -->
            <div style="background: #f8f9fa; padding: 10px; margin-bottom: 15px; border-radius: 4px; font-size: 10pt; color: #666;">
                📊 Next invoice number: ${nextInvoiceNumber}<br>
                Counter for ${invoiceDate}: ${currentCounter} (${currentCounter-1} invoice(s) already generated)
            </div>
            
            <!-- Company Header -->
            <div style="text-align: left; margin-bottom: 50px;">
                <div style="font-weight: bold; font-size: 14pt; margin-bottom: 3px;">
                    ${document.getElementById('companyName').value}
                </div>
                <div style="margin-bottom: 10px;">
                    ${document.getElementById('companyAddress').value}
                </div>
                
                <!-- Thick Line -->
                <div style="width: 100%; height: 3px; background-color: #000000; margin-bottom: 3px;"></div>
                <!-- Thin Line -->
                <div style="width: 100%; height: 1px; background-color: #000000; margin-bottom: 20px;"></div>
                
                <!-- INVOICE Title -->
                <div style="text-align: center; margin-top: 25px;">
                    <div style="font-weight: bold; font-size: 18pt; text-decoration: underline; letter-spacing: 3px;">
                        INVOICE
                    </div>
                </div>
            </div>
            
            <!-- Layout 2 Columns -->
            <table style="width: 100%; margin-bottom: 30px; border-collapse: collapse;">
                <tr>
                    <td style="width: 60%; vertical-align: top; padding-right: 20px;">
                        <div style="margin-bottom: 5px;"><strong>To</strong></div>
                        <div style="font-weight: bold;">${document.getElementById('clientName').value}</div>
                        <div>${document.getElementById('clientAddress').value}</div>
                        <div>${document.getElementById('clientCity').value}</div>
                    </td>
                    
                    <td style="width: 40%; vertical-align: top;">
                        <table style="width: 100%; font-size: 11pt;">
                            <tr>
                                <td style="padding: 3px 0; font-weight: bold; width: 25%;">No.</td>
                                <td style="padding: 3px 0; width: 5%;">:</td>
                                <td style="padding: 3px 0;">${document.getElementById('invoiceNumber').value}</td>
                            </tr>
                            <tr>
                                <td style="padding: 3px 0; font-weight: bold;">Date</td>
                                <td style="padding: 3px 0;">:</td>
                                <td style="padding: 3px 0;">${formatDateIndonesian(document.getElementById('invoiceDate').value)}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            
            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
                <thead>
                    <tr style="background-color: #f0f0f0; border-top: 2px solid #000; border-bottom: 2px solid #000;">
                        <th style="padding: 12px 8px; text-align: center; width: 5%;">No</th>
                        <th style="padding: 12px 8px; text-align: left; width: 25%;">Scope of Work (SoW)</th>
                        <th style="padding: 12px 8px; text-align: left; width: 20%;">Description</th>
                        <th style="padding: 12px 8px; text-align: center; width: 10%;">QTY</th>
                        <th style="padding: 12px 8px; text-align: center; width: 15%;">Unit Price</th>
                        <th style="padding: 12px 8px; text-align: center; width: 15%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <!-- Payment Info & Signature (Sejajar) -->
            <table style="width: 100%; margin-top: 40px; font-size: 10pt;">
                <tr>
                    <!-- KOLOM KIRI: PAYMENT INFORMATION -->
                    <td style="width: 50%; vertical-align: top;">
                        ${hasBankInfo ? `
                            <div style="font-weight: bold; margin-bottom: 8px;">
                                Payment Information
                            </div>
                            ${npwp ? `<div>NPWP : ${npwp}</div>` : ''}
                            ${bankBranch ? `<div>Bank & Branch : ${bankBranch}</div>` : ''}
                            ${accountNumber ? `<div>Account No : ${accountNumber}</div>` : ''}
                            ${accountName ? `<div>Account Name : ${accountName}</div>` : ''}
                            ${phoneNumber ? `<div>Phone : ${phoneNumber}</div>` : ''}
                        ` : ''}
                    </td>

                    <!-- KOLOM KANAN: SIGNATURE -->
                    <td style="width: 50%; vertical-align: top; text-align: right;">
                        ${signatureHTML}
                    </td>
                </tr>
            </table>

        </div>
    `;
}

// Generate PDF
function generatePDF() {
    // INCREMENT COUNTER HANYA DI SINI! (true = increment)
    generateInvoiceNumber(true);

    // Hapus counter info dari preview sebelum generate PDF
    const counterInfo = document.querySelector('#pdfContent > div:first-child');
    if (counterInfo && counterInfo.textContent.includes('Invoice Counter')) {
        counterInfo.style.display = 'none';
    }

    previewInvoice();

    setTimeout(() => {
        const element = document.getElementById('invoicePreview');
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            onclone: function(clonedDoc) {
                const signatureImg = clonedDoc.querySelector('#pdfContent img[alt="Signature"]');
                if (signatureImg && signatureDataURL) {
                    signatureImg.src = signatureDataURL;
                }

                // Pastikan counter info tidak tampil di PDF
                const counterInfoClone = clonedDoc.querySelector('#pdfContent > div:first-child');
                if (counterInfoClone && counterInfoClone.textContent.includes('Next invoice number')) {
                    counterInfoClone.style.display = 'none';
                }
            }
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`invoice-${document.getElementById('invoiceNumber').value.replace(/\//g, '-')}.pdf`);

            // Tampilkan counter info lagi setelah download
            if (counterInfo) {
                counterInfo.style.display = 'block';
            }

            updateCounterInfoDisplay();

            generateInvoiceNumber(false); // false = jangan increment

            // Notifikasi sukses
            showNotification('Invoice downloaded successfully! Counter incremented.');
        });
    }, 500);
}

// Update Clear Form button (ganti dengan yang baru)
function addClearFormButton() {
    // Function ini sekarang deprecated, pake resetFormDataOnly() instead
    // Hapus button clear form yang lama jika ada
    const oldBtn = document.querySelector('.clear-form-btn');
    if (oldBtn) {
        oldBtn.remove();
    }
}

// ========== RESET ALL DATA ==========

// Reset semua data (form + counters + localStorage)
function resetAllData() {
    const hasFormData = localStorage.getItem('invoiceFormData');
    const hasCounters = localStorage.getItem('invoiceCounters');
    const hasSystemDate = localStorage.getItem('lastSystemDate');

    let message = '⚠️ RESET ALL DATA?\n\nThis will delete:\n';

    if (hasFormData) message += '• All form data (inputs, items, signature)\n';
    if (hasCounters) {
        const counters = JSON.parse(hasCounters);
        const dates = Object.keys(counters);
        message += `• Invoice counters (${dates.length} dates, ${Object.values(counters).reduce((a,b) => a + b, 0) - dates.length} total invoices)\n`;
    }
    if (hasSystemDate) message += '• System date tracking\n';

    message += '\n⚠️ WARNING: This cannot be undone!\n';
    message += 'The app will reload after reset.';

    if (confirm(message)) {
        // Clear semua localStorage items
        localStorage.clear();

        // Reset semua global variables
        invoiceCounters = {};
        signatureDataURL = '';
        window.pendingItemsData = null;

        // Tampilkan notification
        showNotification('All data has been reset. Reloading app...');

        // Reload page setelah 1.5 detik
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}

// Reset form data saja (tapi keep counters)
function resetFormDataOnly() {
    if (confirm('Reset form data only?\n\nThis will clear all inputs, items, and signature but keep invoice counters.')) {
        // Hapus form data dari localStorage
        localStorage.removeItem('invoiceFormData');

        // Reset signature
        signatureDataURL = '';
        document.getElementById('signatureUpload').value = '';
        document.getElementById('signaturePreview').style.display = 'none';

        // Reset form fields ke default values
        document.getElementById('companyName').value = 'CV RIEKI SENOKU CREATIVE';
        document.getElementById('companyAddress').value = 'Jakarta Selatan - Indonesia';
        document.getElementById('clientName').value = 'PT ISM BOGASARI FLOUR JAKARTA';
        document.getElementById('clientAddress').value = 'Jl. Raya Clinchip, Tanjung Priok';
        document.getElementById('clientCity').value = 'Jakarta Utara - 14110';
        document.getElementById('npwp').value = '1000 0000 0720 7103';
        document.getElementById('bankBranch').value = 'OCBC - Cabang OCBC Tower';
        document.getElementById('accountNumber').value = '545800120135';
        document.getElementById('accountName').value = 'CV Rieki Senoku Creative';
        document.getElementById('phoneNumber').value = '0812360111';
        document.getElementById('discountAmount').value = '0';
        document.getElementById('taxPercent').value = '0';
        document.getElementById('signatoryName').value = 'Sherly Fanny Heriyanti';
        document.getElementById('signatoryTitle').value = 'CEO';

        // Set tanggal ke hari ini
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = formattedDate;

        // Regenerate invoice number
        generateInvoiceNumber(false);

        // Clear semua items kecuali satu
        const itemsContainer = document.getElementById('itemsContainer');

        // Destroy semua Select2 instances kecuali pertama
        const items = itemsContainer.querySelectorAll('.item-row');
        items.forEach((item, index) => {
            if (index > 0) {
                const dropdown = item.querySelector('.item-sow-dropdown');
                if (dropdown && $(dropdown).hasClass('select2-hidden-accessible')) {
                    $(dropdown).select2('destroy');
                }
            }
        });

        // Hapus semua items kecuali pertama
        while (itemsContainer.children.length > 1) {
            itemsContainer.removeChild(itemsContainer.lastChild);
        }

        // Reset item pertama
        const firstItem = itemsContainer.querySelector('.item-row');
        if (firstItem) {
            const nameInput = firstItem.querySelector('.item-name');
            const descInput = firstItem.querySelector('.item-description');
            const qtyInput = firstItem.querySelector('.item-qty');
            const priceInput = firstItem.querySelector('.item-price');
            const grossupInput = firstItem.querySelector('.item-grossup');
            const dropdown = firstItem.querySelector('.item-sow-dropdown');

            if (nameInput) {
                nameInput.style.display = 'none';
                nameInput.value = '';
            }
            if (descInput) descInput.value = '';
            if (qtyInput) qtyInput.value = '1';
            if (priceInput) priceInput.value = '0';
            if (grossupInput) grossupInput.value = '0';

            // Reset Select2
            if (dropdown) {
                setTimeout(() => {
                    $(dropdown).val('').trigger('change');
                    const defaultSOW = SOW_OPTIONS.find(s => s.name === "Tiktok");
                    if (defaultSOW) {
                        $(dropdown).val(`${defaultSOW.name}|${defaultSOW.price}`).trigger('change');
                    }
                }, 100);
            }
        }

        // Update preview
        setTimeout(() => {
            previewInvoice();
            showNotification('Form data cleared! Counters preserved.');
        }, 300);
    }
}

// Export semua data ke file JSON
function exportAllData() {
    const exportData = {
        exportDate: new Date().toISOString(),
        counters: invoiceCounters,
        formData: JSON.parse(localStorage.getItem('invoiceFormData') || '{}'),
        systemDate: localStorage.getItem('lastSystemDate'),
        metadata: {
            totalDates: Object.keys(invoiceCounters).length,
            totalInvoices: Object.values(invoiceCounters).reduce((a, b) => a + b, 0) - Object.keys(invoiceCounters).length,
            appVersion: '1.0'
        }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `invoice-app-backup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showNotification('All data exported to JSON file!');
}

// Import data dari file JSON
function importAllData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);

                let message = 'Import data?\n\n';
                if (importData.counters) {
                    const dates = Object.keys(importData.counters);
                    message += `• Counters: ${dates.length} dates\n`;
                }
                if (importData.formData && importData.formData.items) {
                    message += `• Form data: ${importData.formData.items.length} items\n`;
                }
                message += `\nExported: ${importData.exportDate || 'Unknown date'}`;

                if (confirm(message)) {
                    // Import counters
                    if (importData.counters) {
                        invoiceCounters = importData.counters;
                        saveInvoiceCounters();
                    }

                    // Import form data
                    if (importData.formData) {
                        localStorage.setItem('invoiceFormData', JSON.stringify(importData.formData));
                    }

                    // Import system date
                    if (importData.systemDate) {
                        localStorage.setItem('lastSystemDate', importData.systemDate);
                    }

                    showNotification('Data imported successfully! Reloading...');

                    // Reload page untuk apply changes
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                }
            } catch (error) {
                alert('Invalid backup file: ' + error.message);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// Add reset all data button
function addResetAllDataButton() {
    const actionsDiv = document.querySelector('.reset-button');
    if (!actionsDiv) return;

    // Cek apakah button sudah ada
    if (document.querySelector('.reset-all-data-btn')) return;

    // Buat container untuk reset buttons
    const resetContainer = document.createElement('div');
    resetContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin: 10px 0 20px 0;
        justify-content: center;
        flex-wrap: wrap;
        border-top: 1px solid #eee;
        padding-top: 15px;
    `;

    // Button Export Data
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '💾 Export All Data';
    exportBtn.className = 'export-data-btn';
    exportBtn.style.cssText = `
        background: #27ae60;
        padding: 8px 15px;
        font-size: 14px;
    `;
    exportBtn.onclick = exportAllData;

    // Button Import Data
    const importBtn = document.createElement('button');
    importBtn.textContent = '📂 Import Data';
    importBtn.className = 'import-data-btn';
    importBtn.style.cssText = `
        background: #2980b9;
        padding: 8px 15px;
        font-size: 14px;
    `;
    importBtn.onclick = importAllData;

    // Button Reset Form Only
    const resetFormBtn = document.createElement('button');
    resetFormBtn.textContent = '🗑️ Reset Form Only';
    resetFormBtn.className = 'reset-form-only-btn';
    resetFormBtn.style.cssText = `
        background: #f39c12;
        padding: 8px 15px;
        font-size: 14px;
    `;
    resetFormBtn.onclick = resetFormDataOnly;

    // Button Reset All Data (Nuclear option)
    const resetAllBtn = document.createElement('button');
    resetAllBtn.textContent = '☢️ Reset ALL Data';
    resetAllBtn.className = 'reset-all-data-btn';
    resetAllBtn.style.cssText = `
        background: #c0392b;
        padding: 8px 15px;
        font-size: 14px;
        font-weight: bold;
    `;
    resetAllBtn.onclick = resetAllData;

    // Tambah buttons ke container
    resetContainer.appendChild(exportBtn);
    resetContainer.appendChild(importBtn);
    resetContainer.appendChild(resetFormBtn);
    resetContainer.appendChild(resetAllBtn);

    // Insert sebelum actions buttons
    const existingCounterContainer = actionsDiv.querySelector('div:first-child');
    if (existingCounterContainer) {
        actionsDiv.insertBefore(resetContainer, existingCounterContainer.nextSibling);
    } else {
        actionsDiv.insertBefore(resetContainer, actionsDiv.firstChild);
    }
}

// ========== END RESET ALL DATA ==========

// Initialize app
function initializeApp() {
    // Set tanggal default ke hari ini
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = formattedDate;

    // Load saved counters
    loadInvoiceCounters();

    // Cek dan reset untuk hari baru
    checkAndResetForNewDay();

    // Load saved form data
    loadFormData();

    // Setup signature upload listener
    document.getElementById('signatureUpload').addEventListener('change', handleSignatureUpload);

    // Auto-generate invoice number jika kosong
    const currentInvoice = document.getElementById('invoiceNumber').value;
    if (!currentInvoice || currentInvoice.trim() === '') {
        generateInvoiceNumber(false); // false = jangan increment
    }

    // Event listener untuk perubahan tanggal
    document.getElementById('invoiceDate').addEventListener('change', function() {
        // Regenerate invoice number dengan counter yang sesuai tanggal baru
        generateInvoiceNumber(false); // false = jangan increment

        // Update preview
        previewInvoice();

        // Refresh
        updateCounterInfoDisplay();

        // Auto-save
        saveFormData();
    });

    // Populate dropdown untuk item pertama
    setTimeout(() => {
        const firstRow = document.querySelector('.item-row');
        if (firstRow) {
            const dropdown = firstRow.querySelector('.item-sow-dropdown');
            populateSOWDropdown(dropdown);

            // Initialize Select2
            initializeSelect2(dropdown);

            // Load saved items setelah Select2 initialized
            setTimeout(loadSavedItems, 300);

            // Set default value hanya jika tidak ada saved data
            if (!window.pendingItemsData || window.pendingItemsData.length === 0) {
                setTimeout(() => {
                    const defaultSOW = SOW_OPTIONS.find(s => s.name === "Tiktok");
                    if (defaultSOW) {
                        $(dropdown).val(`${defaultSOW.name}|${defaultSOW.price}`).trigger('change');
                    }
                }, 100);
            }

            // Set contoh gross up
            const grossUpInput = firstRow.querySelector('.item-grossup');
            grossUpInput.value = 0;
            calculateItemFinalPrice(firstRow);
        }

        // Setup auto-save system
        setTimeout(setupAutoSave, 500);

        // Add Counter Management buttons
        addCounterManagementButtons();

        // Add Reset All Data buttons
        addResetAllDataButton();

        // Add counter info to form
        setTimeout(addCounterInfoToForm, 300);

        previewInvoice();
    }, 300);
}

// ========== COUNTER EDIT/RESET ==========

// Function untuk reset counter tanggal tertentu
function resetCounterForDate(dateString = null) {
    if (!dateString) {
        dateString = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
    }

    const currentCounter = getCounterForDate(dateString);

    const newCounter = prompt(`Reset counter for ${dateString}\nCurrent counter: ${currentCounter}\n\nEnter new counter value (start from 1):`, '1');

    if (newCounter !== null) {
        const counterNum = parseInt(newCounter);
        if (!isNaN(counterNum) && counterNum >= 1) {
            invoiceCounters[dateString] = counterNum;
            saveInvoiceCounters();

            // Regenerate invoice number dengan counter baru
            generateInvoiceNumber(false);
            previewInvoice();

            showNotification(`Counter for ${dateString} reset to ${counterNum}`);
            location.reload();
        } else {
            alert('Please enter a valid number (1 or higher)');
        }
    }
}

// Function untuk view counter info
function viewCounterInfo() {
    const dateString = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
    const counter = getCounterForDate(dateString);
    const nextInvoiceNumber = `RSC/INV/${dateString.replace(/-/g, '')}/${String(counter).padStart(3, '0')}`;

    const info = `
📊 COUNTER INFORMATION
────────────────────
Date: ${dateString}
Current Counter: ${counter}
Next Invoice No: ${nextInvoiceNumber}
Already Generated: ${counter - 1} invoice(s)

📅 COUNTERS HISTORY:
${getCountersHistory()}
`;

    alert(info);
}

// Get counters history untuk display
function getCountersHistory() {
    const dates = Object.keys(invoiceCounters).sort().reverse(); // Sort desc
    let history = '';

    if (dates.length === 0) {
        return 'No counter history yet.';
    }

    dates.slice(0, 10).forEach(date => { // Show last 10 dates
        const counter = invoiceCounters[date];
        const invoiceNo = `RSC/INV/${date.replace(/-/g, '')}/${String(counter).padStart(3, '0')}`;
        history += `${date}: ${counter} (${invoiceNo})\n`;
    });

    if (dates.length > 10) {
        history += `\n... and ${dates.length - 10} more dates`;
    }

    return history;
}

// Add counter management buttons
function addCounterManagementButtons() {
    const actionsDiv = document.querySelector('.actions');
    if (!actionsDiv) return;

    // Cek apakah buttons sudah ada
    if (document.querySelector('.counter-info-btn')) return;

    // Buat container untuk counter buttons
    const counterContainer = document.createElement('div');
    counterContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin: 15px 0;
        justify-content: center;
        flex-wrap: wrap;
    `;

    // // Button Counter Info
    // const infoBtn = document.createElement('button');
    // infoBtn.textContent = '📊 Counter Info';
    // infoBtn.className = 'counter-info-btn';
    // infoBtn.style.cssText = `
    //     background: #3498db;
    //     padding: 8px 15px;
    //     font-size: 14px;
    // `;
    // infoBtn.onclick = viewCounterInfo;
    //
    // // Button Reset Counter
    // const resetBtn = document.createElement('button');
    // resetBtn.textContent = '🔄 Reset Counter';
    // resetBtn.className = 'counter-reset-btn';
    // resetBtn.style.cssText = `
    //     background: #f39c12;
    //     padding: 8px 15px;
    //     font-size: 14px;
    // `;
    // resetBtn.onclick = () => resetCounterForDate();
    //
    // // Button Reset All Counters
    // const resetAllBtn = document.createElement('button');
    // resetAllBtn.textContent = '🗑️ Reset All Counters';
    // resetAllBtn.className = 'counter-reset-all-btn';
    // resetAllBtn.style.cssText = `
    //     background: #e74c3c;
    //     padding: 8px 15px;
    //     font-size: 14px;
    // `;
    // resetAllBtn.onclick = resetAllCounters;
    //
    // // Tambah buttons ke container
    // counterContainer.appendChild(infoBtn);
    // counterContainer.appendChild(resetBtn);
    // counterContainer.appendChild(resetAllBtn);

    // Insert sebelum actions buttons
    actionsDiv.insertBefore(counterContainer, actionsDiv.firstChild);

    // Juga tambah counter info di invoice details section
    addCounterInfoToForm();
}

// Add counter info ke form section
function addCounterInfoToForm() {
    const invoiceDetailsSection = document.querySelector('.section:nth-child(4)'); // Invoice Details section
    if (!invoiceDetailsSection) return;

    // Cek apakah sudah ada
    if (invoiceDetailsSection.querySelector('.counter-info-form')) return;

    const dateString = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
    const counter = getCounterForDate(dateString);
    const nextInvoiceNumber = `RSC/INV/${dateString.replace(/-/g, '')}/${String(counter).padStart(3, '0')}`;

    const counterInfoHTML = `
        <div class="counter-info-form" style="
            background: #f8f9fa;
            padding: 12px;
            margin-top: 15px;
            border-radius: 6px;
            border-left: 4px solid #3498db;
            font-size: 12pt;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>📅 Date:</strong> ${dateString}<br>
                    <strong>🔢 Counter:</strong> ${counter} <small style="color: #666;">(${counter-1} invoice(s) generated)</small><br>
                    <strong>📄 Next Invoice:</strong> ${nextInvoiceNumber}
                </div>
                <div>
                    <button onclick="resetCounterForDate()" style="
                        background: #f39c12;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 11pt;
                        margin-left: 10px;
                    ">
                        Edit Counter
                    </button>
                </div>
            </div>
        </div>
    `;

    // Tambah setelah form-row terakhir
    const formRows = invoiceDetailsSection.querySelectorAll('.form-row');
    const lastFormRow = formRows[formRows.length - 1];
    if (lastFormRow) {
        lastFormRow.insertAdjacentHTML('afterend', counterInfoHTML);
    }
}

// Update counter info display saat tanggal berubah
function updateCounterInfoDisplay() {
    const counterInfoDiv = document.querySelector('.counter-info-form');
    if (!counterInfoDiv) return;

    const dateString = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
    const counter = getCounterForDate(dateString);
    const nextInvoiceNumber = `RSC/INV/${dateString.replace(/-/g, '')}/${String(counter).padStart(3, '0')}`;

    counterInfoDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>📅 Date:</strong> ${dateString}<br>
                <strong>🔢 Counter:</strong> ${counter} <small style="color: #666;">(${counter-1} invoice(s) generated)</small><br>
                <strong>📄 Next Invoice:</strong> ${nextInvoiceNumber}
            </div>
            <div>
                <button onclick="resetCounterForDate()" style="
                    background: #f39c12;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11pt;
                    margin-left: 10px;
                ">
                    Edit Counter
                </button>
            </div>
        </div>
    `;
}

// ========== END COUNTER EDIT/RESET ==========

// Initialize saat halaman load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();

    // Optional: Tambah button reset counter di console untuk debugging
    // console.log('Untuk reset semua counter, ketik: resetAllCounters()');
});