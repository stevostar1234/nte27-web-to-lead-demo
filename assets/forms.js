(function () {
  "use strict";

  var config = window.NTE_CONFIG || window.NTE27_CONFIG || {};
  var pricingVersion = "NTE27-2026-08-17";
  var standardNames = {
    Company: "company",
    FirstName: "first_name",
    LastName: "last_name",
    Email: "email",
    Phone: "phone",
    MobilePhone: "mobile",
    Title: "title",
    Website: "URL",
    Salutation: "salutation"
  };
  var standardFieldLimits = {
    Company: 255,
    FirstName: 40,
    LastName: 80,
    Email: 80,
    Phone: 40,
    MobilePhone: 40,
    Title: 128,
    Website: 255,
    Salutation: 40
  };

  function setStatus(form, message, type) {
    var status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.textContent = message;
    status.className = "status " + type;
    status.hidden = false;
    status.setAttribute("tabindex", "-1");
    status.focus();
  }

  function configureShell() {
    if (config.siteNotice && document.body && document.createElement && !document.querySelector("[data-site-notice]")) {
      var notice = document.createElement("aside");
      notice.className = "sandbox-notice";
      notice.setAttribute("data-site-notice", "");
      notice.textContent = config.siteNotice;
      var main = document.querySelector("main");
      if (main) main.parentNode.insertBefore(notice, main);
    }
    document.querySelectorAll("[data-current-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
    document.querySelectorAll('[data-config-link="terms"]').forEach(function (link) {
      if (config.termsUrl) {
        link.href = config.termsUrl;
        if (config.termsLinkLabel) link.textContent = config.termsLinkLabel;
      } else {
        link.href = "#terms-link-required";
        link.setAttribute("aria-disabled", "true");
        link.title = "The final NTE27 Terms and Conditions PDF URL is still required.";
        link.addEventListener("click", function (event) { event.preventDefault(); });
      }
    });
    document.querySelectorAll('[data-config-link="logo"]').forEach(function (link) {
      if (config.logoFileRequestUrl) {
        link.href = config.logoFileRequestUrl;
        link.removeAttribute("aria-disabled");
      } else {
        link.href = "#logo-link-required";
        link.setAttribute("aria-disabled", "true");
        link.title = "The secure upload link is not currently available.";
        link.addEventListener("click", function (event) { event.preventDefault(); });
      }
    });
  }

  function enableConditionalSections() {
    document.querySelectorAll("[data-conditional-for]").forEach(function (target) {
      var source = document.getElementById(target.dataset.conditionalFor);
      if (!source) return;
      function sync() {
        var expected = (target.dataset.conditionalValue || "Yes").split("|");
        var value = source.type === "checkbox" ? (source.checked ? "Yes" : "No") : (source.type === "radio" ? (source.checked ? source.value : "") : source.value);
        var show = expected.indexOf(value) !== -1;
        target.hidden = !show;
        target.querySelectorAll("input, select, textarea, button").forEach(function (control) {
          control.disabled = !show;
          if (control.hasAttribute("data-required-when-visible")) control.required = show;
        });
      }
      source.addEventListener("change", sync);
      if (source.type === "radio" && source.name) {
        document.querySelectorAll('input[type="radio"][name="' + source.name + '"]').forEach(function (radio) { radio.addEventListener("change", sync); });
      }
      sync();
    });
  }

  function configureFieldConstraints() {
    document.querySelectorAll("[data-sf-field]").forEach(function (control) {
      if (!/^(INPUT|TEXTAREA)$/.test(control.tagName) || /^(checkbox|radio|hidden)$/i.test(control.type || "")) return;
      var limit = standardFieldLimits[control.dataset.sfField] || (config.fieldLimits || {})[control.dataset.sfField];
      if (limit && !control.hasAttribute("maxlength")) control.maxLength = limit;
    });
  }

  function syncCombinedFields(form) {
    form.querySelectorAll("[data-combine-fields]").forEach(function (target) {
      var ids = target.dataset.combineFields.split(",");
      target.value = ids.map(function (id) {
        var source = document.getElementById(id.trim());
        return source ? source.value.trim() : "";
      }).filter(Boolean).join(" ");
    });
    form.querySelectorAll("[data-copy-value-from]").forEach(function (target) {
      var source = document.getElementById(target.dataset.copyValueFrom);
      target.value = source ? source.value : "";
    });
    form.querySelectorAll("[data-switch-copy]").forEach(function (target) {
      var switcher = document.getElementById(target.dataset.switchCopy);
      var sourceList = switcher && switcher.value === "No" ? target.dataset.copyWhenNo : target.dataset.copyWhenYes;
      var values = (sourceList || "").split(",").map(function (id) {
        var source = document.getElementById(id.trim());
        return source ? source.value.trim() : "";
      }).filter(Boolean);
      target.value = target.dataset.copyMode === "combine" ? values.join(" ") : (values[0] || "");
    });
  }

  function eventCodeFor(date) {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "numeric"
    }).formatToParts(date || new Date());
    var year = Number(parts.find(function (part) { return part.type === "year"; }).value);
    var month = Number(parts.find(function (part) { return part.type === "month"; }).value);
    return "NTE" + String(month >= 4 ? year + 1 : year);
  }

  function bookingReference() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var bytes = new Uint8Array(8);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      bytes.forEach(function (_, index) { bytes[index] = Math.floor(Math.random() * 256); });
    }
    var suffix = Array.prototype.map.call(bytes, function (value) {
      return alphabet.charAt(value % alphabet.length);
    }).join("");
    return "NTE-" + Date.now() + "-" + suffix;
  }

  function populateSystemFields(form) {
    var eventField = form.querySelector('[data-sf-field="NTE_Event_Code__c"]');
    if (eventField) eventField.value = eventCodeFor(new Date());
    var bookingField = form.querySelector('[data-sf-field="Booking_Reference__c"]');
    if (bookingField && !bookingField.value) bookingField.value = bookingReference();
  }

  function setPricingField(form, api, value) {
    var field = form.querySelector('[data-sf-field="' + api + '"]');
    if (field) field.value = String(value);
  }

  function calculatePartnerPricing(selectedPrices) {
    var total = 0;
    var priceOnRequest = false;
    selectedPrices.forEach(function (rawPrice) {
      if (rawPrice === "poa") {
        priceOnRequest = true;
        return;
      }
      var price = Number(rawPrice);
      if (Number.isFinite(price)) total += price;
    });
    return {packageTotal: total, total: total, priceOnRequest: priceOnRequest};
  }

  function calculateExhibitorPricing(options) {
    options = options || {};
    var priceOnRequest = options.spacePrice === "poa";
    var spacePrice = priceOnRequest ? 0 : Number(options.spacePrice || 0);
    var discounted = /Charity|Government|Blue Light/.test(options.category || "");
    var socketCount = Math.max(0, Number(options.socketCount || 0));
    var staffCount = Math.max(0, Number(options.staffCount || 0));
    var powerUnitPrice = options.powerRequired === "Yes" ? (discounted ? 50 : 100) : 0;
    var staffUnitPrice = options.staffRequired === "Yes" ? 50 : 0;
    var powerTotal = powerUnitPrice * socketCount;
    var staffTotal = staffUnitPrice * staffCount;
    return {
      spacePrice: Number.isFinite(spacePrice) ? spacePrice : 0,
      powerUnitPrice: powerUnitPrice,
      powerTotal: powerTotal,
      staffUnitPrice: staffUnitPrice,
      staffTotal: staffTotal,
      total: (Number.isFinite(spacePrice) ? spacePrice : 0) + powerTotal + staffTotal,
      discounted: discounted,
      priceOnRequest: priceOnRequest
    };
  }

  function setupPackageSummary() {
    var checkboxes = Array.prototype.slice.call(document.querySelectorAll("[data-package-price]"));
    var countNode = document.querySelector("[data-package-count]");
    var totalNode = document.querySelector("[data-package-total]");
    if (!checkboxes.length || !countNode || !totalNode) return;
    function sync() {
      var selected = checkboxes.filter(function (box) { return box.checked; });
      var pricing = calculatePartnerPricing(selected.map(function (box) { return box.dataset.packagePrice; }));
      var total = pricing.total;
      var hasPoa = pricing.priceOnRequest;
      countNode.textContent = selected.length ? selected.length + " package" + (selected.length === 1 ? "" : "s") + " selected" : "No packages selected";
      totalNode.textContent = total ? "Listed-price total: " + new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP",maximumFractionDigits:0}).format(total) + (hasPoa ? " plus price-on-request items" : "") : (hasPoa ? "Price on request" : "£0");
      var form = checkboxes[0].form;
      if (form) {
        setPricingField(form, "Sponsor_Package_Total__c", pricing.packageTotal);
        setPricingField(form, "Listed_Price_Total__c", pricing.total);
        setPricingField(form, "Price_On_Request__c", hasPoa ? "1" : "0");
        setPricingField(form, "Pricing_Status__c", hasPoa ? "Price on request" : "Calculated");
        setPricingField(form, "Pricing_Version__c", pricingVersion);
      }
    }
    checkboxes.forEach(function (box) { box.addEventListener("change", sync); });
    sync();
  }

  function setupExhibitorEstimate() {
    var form = document.querySelector('[data-form-kind="exhibitor"]');
    if (!form) return;
    var output = document.querySelector("[data-estimate]");
    function checkedValue(name) {
      var node = form.querySelector('[name="' + name + '"]:checked');
      return node ? node.value : "";
    }
    function sync() {
      var space = form.querySelector('[name="exhibitor-space"]:checked');
      var powerIncluded = space && space.dataset.powerIncluded === "true";
      var powerLabel = document.getElementById("power-question-label");
      var powerHelp = document.getElementById("power-question-help");
      if (powerLabel) powerLabel.textContent = powerIncluded ? "Do you need any additional power sockets for £100 + VAT per socket?" : "Do you need power on your stand for an additional £100 + VAT per socket?";
      if (powerHelp) powerHelp.textContent = powerIncluded ? "Your selected space includes standard power. Select Yes only if you need additional sockets. Charities, government and blue light organisations qualify for a 50% discount on additional sockets." : "Unless indicated here, power may not be possible. Charities, government and blue light organisations qualify for a 50% discount.";
      var category = document.getElementById("organisation-category");
      var socketCount = Number((document.getElementById("power-count") || {}).value || 0);
      var staffCount = Number((document.getElementById("additional-staff-count") || {}).value || 0);
      var pricing = calculateExhibitorPricing({
        spacePrice: space ? space.dataset.price : 0,
        category: category ? category.value : "",
        powerRequired: checkedValue("power-required"),
        socketCount: socketCount,
        staffRequired: checkedValue("additional-staff-required"),
        staffCount: staffCount
      });
      var priceOnApplication = pricing.priceOnRequest;
      var total = pricing.total;
      var discounted = pricing.discounted;
      setPricingField(form, "Exhibitor_Space_Price__c", pricing.spacePrice);
      setPricingField(form, "Power_Socket_Unit_Price__c", pricing.powerUnitPrice);
      setPricingField(form, "Power_Socket_Total__c", pricing.powerTotal);
      setPricingField(form, "Additional_Staff_Unit_Price__c", pricing.staffUnitPrice);
      setPricingField(form, "Additional_Staff_Total__c", pricing.staffTotal);
      setPricingField(form, "Listed_Price_Total__c", pricing.total);
      setPricingField(form, "Price_On_Request__c", priceOnApplication ? "1" : "0");
      setPricingField(form, "Pricing_Status__c", priceOnApplication ? "Price on request" : "Calculated");
      setPricingField(form, "Pricing_Version__c", pricingVersion);
      if (output) {
        if (!space) output.textContent = "Select a space to see an indicative ex-VAT total.";
        else if (priceOnApplication && total) output.textContent = "Listed add-ons: " + new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP"}).format(total) + " plus the space price on application.";
        else if (priceOnApplication) output.textContent = "Space price on application.";
        else output.textContent = "Indicative ex-VAT total: " + new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP"}).format(total);
      }
      var discount = document.querySelector("[data-power-discount]");
      if (discount) discount.textContent = discounted ? "Your selected organisation category appears eligible for the 50% power discount; Mission Community will verify eligibility." : "Charities, government and blue-light organisations qualify for a 50% power discount.";
    }
    form.addEventListener("change", sync);
    form.addEventListener("input", sync);
    sync();
  }

  function setupStaffEstimate() {
    var form = document.querySelector('[data-form-kind="staff-update"]');
    if (!form) return;
    function sync() {
      var required = (document.getElementById("staff-additional") || {}).value === "Yes";
      var count = Number((document.getElementById("staff-additional-count") || {}).value || 0);
      setPricingField(form, "Additional_Staff_Unit_Price__c", required ? 50 : 0);
      setPricingField(form, "Additional_Staff_Total__c", required ? count * 50 : 0);
      setPricingField(form, "Pricing_Version__c", pricingVersion);
    }
    form.addEventListener("change", sync);
    sync();
  }

  function collectFields(form) {
    syncCombinedFields(form);
    var grouped = {};
    form.querySelectorAll("[data-sf-field]").forEach(function (control) {
      if (control.disabled) return;
      var api = control.dataset.sfField;
      if (!api) return;
      if ((control.type === "checkbox" || control.type === "radio") && !control.checked) return;
      var value = control.type === "checkbox" && api === "Terms_and_Conditions__c" ? "1" : control.value;
      if (typeof value === "string") value = value.trim();
      if (value === "") return;
      if (!grouped[api]) grouped[api] = [];
      grouped[api].push(value);
    });
    return grouped;
  }

  function missingFieldIds(grouped) {
    return Object.keys(grouped).filter(function (api) {
      return /__c$/.test(api) && !config.customFieldIds[api];
    });
  }

  function missingProductionConfig(form) {
    var missing = [];
    if (!config.endpoint) missing.push("Salesforce endpoint");
    if (!config.orgId) missing.push("Salesforce organisation ID");
    if (!config.returnUrl) missing.push("post-submission return URL");
    if (form.querySelector('[data-config-link="terms"]') && !config.termsUrl) missing.push("Terms and Conditions PDF URL");
    return missing;
  }

  function submitToSalesforce(form, grouped) {
    var postForm = document.createElement("form");
    postForm.method = "post";
    postForm.action = config.endpoint;
    postForm.hidden = true;
    function append(name, value) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      postForm.appendChild(input);
    }
    append("oid", config.orgId);
    append("retURL", config.returnUrl);
    append("lead_source", form.dataset.leadSource || "Web");
    append("useDefaultRule", "1");
    Object.keys(grouped).forEach(function (api) {
      var name = /__c$/.test(api) ? config.customFieldIds[api] : (standardNames[api] || api);
      append(name, grouped[api].join(";"));
    });
    document.body.appendChild(postForm);
    postForm.submit();
  }

  function enableForms() {
    document.querySelectorAll("form[data-web-to-lead]").forEach(function (form) {
      populateSystemFields(form);
      var honeypot = document.createElement("input");
      honeypot.type = "text";
      honeypot.name = "website_confirm";
      honeypot.tabIndex = -1;
      honeypot.autocomplete = "off";
      honeypot.setAttribute("aria-hidden", "true");
      honeypot.style.position = "absolute";
      honeypot.style.left = "-10000px";
      honeypot.style.width = "1px";
      honeypot.style.height = "1px";
      honeypot.dataset.formHoneypot = "";
      form.appendChild(honeypot);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (form.dataset.submitting === "true") return;
        if (honeypot.value) {
          setStatus(form, "Your submission could not be processed. Please reload the page and try again.", "error");
          return;
        }
        populateSystemFields(form);
        syncCombinedFields(form);
        var incompleteGroup = Array.prototype.slice.call(form.querySelectorAll("[data-required-checkbox-group]")).find(function (group) {
          return !group.querySelector('input[type="checkbox"]:checked');
        });
        if (incompleteGroup) {
          setStatus(form, incompleteGroup.dataset.requiredMessage || "Please select at least one option.", "error");
          var firstBox = incompleteGroup.querySelector('input[type="checkbox"]');
          if (firstBox) firstBox.focus();
          return;
        }
        if (!form.reportValidity()) {
          setStatus(form, "Please complete the highlighted required fields.", "error");
          return;
        }
        var grouped = collectFields(form);
        var missing = missingFieldIds(grouped);
        if (config.mode === "review") {
          var confirmation = form.dataset.confirmationPreview || "Thank you. We have received your submission.";
          var reference = grouped.Booking_Reference__c && grouped.Booking_Reference__c[0];
          if (reference) confirmation += " Your booking reference is " + reference + ".";
          setStatus(form, confirmation, "success");
          return;
        }
        var missingConfig = missingProductionConfig(form);
        if (missingConfig.length) {
          setStatus(form, "Submission is disabled because production configuration is missing: " + missingConfig.join(", ") + ".", "error");
          return;
        }
        if (missing.length) {
          setStatus(form, "Submission is disabled because Salesforce field IDs are missing for: " + missing.join(", ") + ".", "error");
          return;
        }
        form.dataset.submitting = "true";
        form.setAttribute("aria-busy", "true");
        form.querySelectorAll('[type="submit"]').forEach(function (button) {
          button.disabled = true;
          button.dataset.originalText = button.textContent;
          button.textContent = "Submitting…";
        });
        submitToSalesforce(form, grouped);
      });
      form.addEventListener("input", function () { syncCombinedFields(form); });
    });
  }

  configureShell();
  enableConditionalSections();
  configureFieldConstraints();
  setupPackageSummary();
  setupExhibitorEstimate();
  setupStaffEstimate();
  enableForms();

  window.NTEFormUtils = {
    eventCodeFor: eventCodeFor,
    bookingReference: bookingReference,
    calculatePartnerPricing: calculatePartnerPricing,
    calculateExhibitorPricing: calculateExhibitorPricing
  };
}());
