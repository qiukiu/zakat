document.addEventListener('DOMContentLoaded', function() {
    // Toggle donation type buttons
    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            this.classList.toggle('active');
            const section = document.getElementById('section-' + type);
            section.style.display = this.classList.contains('active') ? 'block' : 'none';
            updateSummary();
        });
    });

    // Generate fields for Zakat Fitrah based on "Jumlah Jiwa"
    document.getElementById('jumlahJiwa').addEventListener('change', function() {
        const count = parseInt(this.value) || 0;
        const container = document.getElementById('fitrahNames');
        container.innerHTML = ''; // Clear previous fields
        for (let i = 1; i <= count; i++) {
            const label = document.createElement('label');
            label.textContent = 'Nama Lengkap ' + i + ':';
            label.setAttribute('for', 'namaFitrah_' + i);
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'namaFitrah_' + i;
            input.name = 'namaFitrah_' + i;
            input.required = true;
            container.appendChild(label);
            container.appendChild(input);
        }
        updateSummary();
    });

    // Update summary when inputs change
    const inputs = document.querySelectorAll('#donationForm input');
    inputs.forEach(input => {
        input.addEventListener('input', updateSummary);
    });

    // Payment methods event listeners
    const paymentButtons = document.querySelectorAll('.payment-button');
    const paymentEvidenceSection = document.getElementById('paymentEvidenceSection');

    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            paymentButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updatePaymentEvidence(this.getAttribute('data-method'));
        });
    });

    function updatePaymentEvidence(method) {
        let html = '';
        if (method === 'IBAN transfer') {
            html = `
                <div class="iban-section">
                    <h3>Detail Transfer IBAN</h3>
                    <table border="1" cellpadding="10" cellspacing="0">
                        <tr>
                            <td><strong>Nama Bank</strong></td>
                            <td>Bremische Volksbank</td>
                        </tr>
                        <tr>
                            <td><strong>Atas Nama</strong></td>
                            <td>KMIB.e.V</td>
                        </tr>
                        <tr>
                            <td><strong>IBAN</strong></td>
                            <td>
                                <span id="ibanField">DE66291900240049959500</span>
                                <button type="button" id="copyIbanButton" class="btn btn-secondary">Salin IBAN</button>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Zweck</strong></td>
                            <td>Zakat (nama)</td>
                        </tr>
                    </table>
                    <br>
                    <input type="checkbox" id="transferConfirmation" name="transferConfirmation" value="ya" required>
                    <label for="transferConfirmation">Saya sudah transfer</label>
                </div>
            `;
        } else if (method === 'Paypal friends and familly') {
            html = `
                <div class="paypal-section">
                    <h3>Detail Transfer PayPal</h3>
                    <table border="1" cellpadding="10" cellspacing="0">
                        <tr>
                            <td><strong>Email PayPal</strong></td>
                            <td>paypal@kmibremen.de</td>
                            <td rowspan="3"><a href="http://paypal.me/Wvidjaja" class="button-link" target="_blank">Paypal KMIB</a></td>
                        </tr>
                        <tr>
                            <td><strong>Zweck</strong></td>
                            <td>Zakat (nama)</td>
                        </tr>
                        <tr>
                            <td><strong>Opsi</strong></td>
                            <td>Paypal friends and family!</td>
                        </tr>
                    </table>
                    <br>
                    <input type="checkbox" id="transferConfirmation" name="transferConfirmation" value="ya" required>
                    <label for="transferConfirmation">Saya sudah transfer</label>
                </div>
            `;
        } else if (method === 'Cash') {
            html = `
                <h3>Detail Cash</h3>
                <table border="1" cellpadding="10" cellspacing="0">
                    <tr>
                        <td><strong>Tempat</strong></td>
                        <td>Musholla Ar-Raudhah</td>
                    </tr>
                    <tr>
                        <td><strong>Alamat</strong></td>
                        <td>Woltmershauserstr. 466</td>
                    </tr>
                    <tr>
                        <td><strong>Waktu</strong></td>
                        <td>21,22,28,29 Maret 2025</td>
                    </tr>
                </table>
                <input type="checkbox" id="cashConfirmation" name="cashConfirmation" value="ya" required>
                <label for="cashConfirmation">Saya akan hadir secara langsung untuk pembayaran tunai.</label>
            `;
        }
        paymentEvidenceSection.innerHTML = html;

        // Attach IBAN copy event listener if IBAN transfer is selected
        if (method === 'IBAN transfer') {
            const copyButton = document.getElementById('copyIbanButton');
            if (copyButton) {
                copyButton.addEventListener('click', function() {
                    const text = document.getElementById('ibanField').textContent; // Use textContent instead of value
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text)
                            .then(() => alert("IBAN berhasil disalin!"))
                            .catch(err => {
                                console.error("Clipboard error:", err);
                                fallbackCopyText(text);
                            });
                    } else {
                        fallbackCopyText(text);
                    }
                });
            }
        }
    }

    function updateSummary() {
        let total = 0;
        // Zakat Fitrah: jumlah jiwa x 10€
        if (document.querySelector('.toggle-button[data-type="fitrah"]').classList.contains('active')) {
            const jumlahJiwa = parseInt(document.getElementById('jumlahJiwa').value) || 0;
            total += jumlahJiwa * 10;
        }
        // Zakat Maal: jumlah yang diinput
        if (document.querySelector('.toggle-button[data-type="maal"]').classList.contains('active')) {
            const jumlahMaal = parseFloat(document.getElementById('jumlahMaal').value) || 0;
            total += jumlahMaal;
        }
        // Fidyah: jumlah hari x 3€
        if (document.querySelector('.toggle-button[data-type="fidyah"]').classList.contains('active')) {
            const jumlahHari = parseInt(document.getElementById('jumlahHari').value) || 0;
            total += jumlahHari * 3;
        }
        // Infak: jumlah yang diinput
        if (document.querySelector('.toggle-button[data-type="infak"]').classList.contains('active')) {
            const jumlahInfak = parseFloat(document.getElementById('jumlahInfak').value) || 0;
            total += jumlahInfak;
        }
        document.getElementById('summaryText').textContent = 'Total: ' + total + '€';
    }

    // Form submission: send data to Google Apps Script
    // Form submission: send data to Google Apps Script
    document.getElementById('donationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        // Collect the active payment method
        let paymentMethod = '';
        const paymentButtons = document.querySelectorAll('.payment-button');
        paymentButtons.forEach(btn => {
            if (btn.classList.contains('active')) {
                paymentMethod = btn.getAttribute('data-method');
            }
        });

        // Append the payment method to the form data
        formData.append('paymentMethod', paymentMethod); // Ensure this line is present

        // Redirect to confirmation page with summary data
        const summaryData = {};
        formData.forEach((value, key) => {
            if (key !== 'niat' && key !== 'transferConfirmation' && key !== 'acknowledge') {
                summaryData[key] = value;
            }
        });

        const queryString = new URLSearchParams(summaryData).toString();
        window.location.href = 'confirmation.html?' + queryString;
    

        fetch('https://script.google.com/macros/s/AKfycbyWYqd7kej26OReycEEyBsI6gQ-qSezazaA05rZNOWVy_fbaaLckfUbz-0WGNmq7SAL/exec', {
            method: 'POST',
            body: formData
        });
    });
});
