/**
 * Rep QR Events - walk-through state and navigation
 */
(function () {
  const CONFIG = window.REPQR_EVENTS_CONFIG || {};
  const PRICING = window.REPQR_EVENTS_PRICING || { firstVideo: 299, additionalVideo: 75, nfcPerVideo: 25, nfcExtraPer100: 50, cupPrice: 18 };

  let currentStep = 0;
  const totalSteps = 6;
  let selectedTemplate = 'charity';

  const stepCards = document.querySelectorAll('.step-card');
  const journeySteps = document.querySelectorAll('.journey-step');
  const stepPill = document.getElementById('step-pill');
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');
  const templateGrid = document.getElementById('template-grid');
  const customDescribeWrap = document.getElementById('custom-describe-wrap');
  const videoCountInput = document.getElementById('video-count');
  const videoLabelsContainer = document.getElementById('video-labels-container');
  const videoPriceLine = document.getElementById('video-price-line');
  const offeringsList = document.getElementById('offerings-list');
  const nfcIncludedEl = document.getElementById('nfc-included');
  const nfcExtraInput = document.getElementById('nfc-extra');
  const cupBundlesInput = document.getElementById('cup-bundles');
  const paymentBreakdown = document.getElementById('payment-breakdown');
  const payTotalSpan = document.getElementById('pay-total');
  const payBtn = document.getElementById('pay-btn');
  const backFromPay = document.getElementById('back-from-pay');
  const mainWizardActions = document.getElementById('main-wizard-actions');

  function getTemplateKey() {
    return selectedTemplate || 'charity';
  }

  function getConfig() {
    return CONFIG[getTemplateKey()] || CONFIG.custom;
  }

  function setStep(step) {
    currentStep = Math.max(0, Math.min(step, totalSteps - 1));
    stepCards.forEach((card, i) => card.classList.toggle('active', i === currentStep));
    journeySteps.forEach((el, i) => {
      el.classList.remove('active', 'completed');
      if (i === currentStep) el.classList.add('active');
      else if (i < currentStep) el.classList.add('completed');
    });
    stepPill.textContent = 'Step ' + (currentStep + 1) + ' of ' + totalSteps;
    backBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    nextBtn.style.display = currentStep >= 4 ? 'none' : '';
    mainWizardActions.style.display = currentStep >= 4 ? 'none' : 'flex';
    if (currentStep === 1) renderOfferings();
    if (currentStep === 2) renderVideoLabels();
    if (currentStep === 3) { updateNfcIncluded(); updateCupTotalCopy(); }
    if (currentStep === 4) renderPaymentBreakdown();
  }

  templateGrid.addEventListener('click', function (e) {
    const card = e.target.closest('.option-card');
    if (!card) return;
    templateGrid.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedTemplate = card.getAttribute('data-template');
    customDescribeWrap.style.display = selectedTemplate === 'custom' ? 'block' : 'none';
  });

  backBtn.addEventListener('click', () => setStep(currentStep - 1));
  nextBtn.addEventListener('click', () => {
    if (currentStep === 0 && !selectedTemplate) return;
    if (currentStep === 1 && selectedTemplate === 'custom') {
      const desc = document.getElementById('custom-describe');
      if (desc && !desc.value.trim()) {
        desc.placeholder = 'Please describe your event so Rep QR can suggest the right setup.';
        return;
      }
    }
    setStep(currentStep + 1);
  });

  function getVideoCount() {
    const n = parseInt(videoCountInput.value, 10);
    return isNaN(n) || n < 1 ? 1 : Math.min(999, n);
  }

  function renderVideoLabels() {
    const count = getVideoCount();
    const cfg = getConfig();
    const labels = (cfg.videoLabels || []).slice(0, count);
    while (labels.length < count) labels.push('Video ' + (labels.length + 1));
    videoLabelsContainer.innerHTML = labels.map((label, i) =>
      '<div class="video-label-row"><span>Video ' + (i + 1) + '</span><input type="text" data-video-label="' + i + '" value="' + escapeAttr(label) + '" placeholder="Label for this video" /></div>'
    ).join('');
    updateVideoPriceLine();
  }

  function escapeAttr(s) {
    if (s == null) return '';
    return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  videoCountInput.addEventListener('change', function () {
    const n = getVideoCount();
    videoCountInput.value = n;
    if (currentStep === 2) renderVideoLabels();
    updateVideoPriceLine();
  });

  function updateVideoPriceLine() {
    const n = getVideoCount();
    const first = PRICING.firstVideo || 299;
    const add = PRICING.additionalVideo || 75;
    const total = n === 1 ? first : first + (n - 1) * add;
    if (videoPriceLine) videoPriceLine.textContent = n + ' video(s) = $' + total + ' (' + (n === 1 ? '$299' : '$299 + ' + (n - 1) + ' × $75') + ')';
  }

  function renderOfferings() {
    const cfg = getConfig();
    const list = cfg.offerings || [];
    offeringsList.innerHTML = list.map(o => '<li>' + escapeHtml(o) + '</li>').join('');
  }

  function escapeHtml(s) {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function updateNfcIncluded() {
    const n = getVideoCount();
    const per = PRICING.nfcPerVideo || 25;
    const total = n * per;
    if (nfcIncludedEl) nfcIncludedEl.textContent = total + ' (' + n + ' × ' + per + ')';
    const cupPriceLine = document.getElementById('cup-price-line');
    if (cupPriceLine) cupPriceLine.textContent = '$' + (PRICING.cupPrice || 18) + ' per cup (laser-engraved QR code).';
  }

  function getNfcExtraHundreds() {
    const val = parseInt(document.getElementById('nfc-extra').value, 10);
    if (isNaN(val) || val < 0) return 0;
    return Math.floor(val / 100);
  }

  function getVideoTotal() {
    const n = getVideoCount();
    const first = PRICING.firstVideo || 299;
    const add = PRICING.additionalVideo || 75;
    return n === 1 ? first : first + (n - 1) * add;
  }

  function getNfcExtraTotal() {
    const hundreds = getNfcExtraHundreds();
    const rate = PRICING.nfcExtraPer100 || 50;
    return hundreds * rate;
  }

  function getCupBundles() {
    const el = document.getElementById('cup-bundles');
    if (!el) return 0;
    const n = parseInt(el.value, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function getCupCount() {
    return getCupBundles() * 25;
  }

  function updateCupTotalCopy() {
    const copy = document.getElementById('cup-total-copy');
    if (!copy) return;
    const bundles = getCupBundles();
    const cups = bundles * 25;
    copy.textContent = cups === 0 ? '0 cups' : cups + ' cups';
  }

  function getCupTotal() {
    const n = getCupCount();
    const rate = PRICING.cupPrice || 18;
    return n * rate;
  }

  function getGrandTotal() {
    return getVideoTotal() + getNfcExtraTotal() + getCupTotal();
  }

  function renderPaymentBreakdown() {
    const videoTotal = getVideoTotal();
    const n = getVideoCount();
    const first = PRICING.firstVideo || 299;
    const add = PRICING.additionalVideo || 75;
    let html = '<div class="row"><span>Event: ' + (document.getElementById('event-name').value || 'My Event') + '</span></div>';
    html += '<div class="row"><span>' + n + ' video(s)</span><span>$' + videoTotal + '</span></div>';
    if (n > 1) html += '<div class="row"><span>First video</span><span>$' + first + '</span></div>';
    if (n > 1) html += '<div class="row"><span>+' + (n - 1) + ' additional @ $' + add + ' each</span><span>$' + ((n - 1) * add) + '</span></div>';
    const nfcExtra = getNfcExtraTotal();
    if (nfcExtra > 0) {
      const hundreds = getNfcExtraHundreds();
      html += '<div class="row"><span>Additional NFC (' + (hundreds * 100) + ' items @ $50/100)</span><span>$' + nfcExtra + '</span></div>';
    }
    const cupTotal = getCupTotal();
    if (cupTotal > 0) {
      const cups = getCupCount();
      const bundles = getCupBundles();
      const cupPrice = PRICING.cupPrice || 18;
      html += '<div class="row"><span>Stainless steel cups (' + cups + ' = ' + bundles + ' × 25 @ $' + cupPrice + '/cup)</span><span>$' + cupTotal + '</span></div>';
    }
    html += '<div class="row total"><span>Total</span><span>$' + getGrandTotal() + '</span></div>';
    paymentBreakdown.innerHTML = html;
    payTotalSpan.textContent = '$' + getGrandTotal();
  }

  nfcExtraInput.addEventListener('input', function () {
    if (currentStep === 4) renderPaymentBreakdown();
  });
  if (cupBundlesInput) {
    cupBundlesInput.addEventListener('input', function () {
      updateCupTotalCopy();
      if (currentStep === 4) renderPaymentBreakdown();
    });
  }

  backFromPay.addEventListener('click', () => setStep(3));
  payBtn.addEventListener('click', function () {
    setStep(5);
  });

  document.getElementById('go-to-events').addEventListener('click', function () {
    alert('Rep QR Events dashboard would open here. This is a prototype.');
  });

  document.getElementById('save-draft-btn').addEventListener('click', function () {
    alert('Rep QR would save your draft. This is a prototype.');
  });

  function startOver() {
    selectedTemplate = 'charity';
    templateGrid.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
    const charityCard = templateGrid.querySelector('[data-template="charity"]');
    if (charityCard) charityCard.classList.add('active');
    if (customDescribeWrap) customDescribeWrap.style.display = 'none';
    var eventName = document.getElementById('event-name');
    var eventDate = document.getElementById('event-date');
    var eventVenue = document.getElementById('event-venue');
    var customDescribe = document.getElementById('custom-describe');
    var eventMessage = document.getElementById('event-message');
    var nfcExtra = document.getElementById('nfc-extra');
    var cupBundles = document.getElementById('cup-bundles');
    var shipLine1 = document.getElementById('ship-line1');
    var shipLine2 = document.getElementById('ship-line2');
    var shipCity = document.getElementById('ship-city');
    var shipState = document.getElementById('ship-state');
    var shipPostal = document.getElementById('ship-postal');
    var shipCountry = document.getElementById('ship-country');
    if (eventName) eventName.value = '';
    if (eventDate) eventDate.value = '';
    if (eventVenue) eventVenue.value = '';
    if (customDescribe) customDescribe.value = '';
    if (eventMessage) eventMessage.value = '';
    if (videoCountInput) videoCountInput.value = '1';
    if (nfcExtra) nfcExtra.value = '0';
    if (cupBundles) cupBundles.value = '0';
    if (shipLine1) shipLine1.value = '';
    if (shipLine2) shipLine2.value = '';
    if (shipCity) shipCity.value = '';
    if (shipState) shipState.value = '';
    if (shipPostal) shipPostal.value = '';
    if (shipCountry) shipCountry.value = 'United States';
    setStep(0);
  }

  document.getElementById('start-over-btn').addEventListener('click', startOver);

  setStep(0);
})();
