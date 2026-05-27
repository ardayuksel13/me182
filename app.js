(function () {
  const page = document.body.dataset.page;

  function isTypingTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  if (page === "home") {
    initHome();
  }

  if (page === "note") {
    initNote();
  }

  function initHome() {
    const signupForm = qs("signupForm");
    const statusEl = qs("signupStatus");
    const emailInput = qs("schoolEmail");
    const noteSearch = qs("noteSearch");
    const noteItems = Array.from(document.querySelectorAll(".note-item"));
    const dashboard = qs("dashboard");

    const dropZone = qs("dropZone");
    const fileInput = qs("fileInput");
    const pickFilesBtn = qs("pickFilesBtn");
    const uploadList = qs("uploadList");

    const criticalHint = qs("criticalHint");
    const openCriticalHint = qs("openCriticalHint");
    const closeCriticalHint = qs("closeCriticalHint");

    let selectedIndex = 0;
    let gPressedAt = 0;

    if (signupForm && statusEl) {
      signupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const isEdu = email.endsWith(".edu") || email.endsWith(".edu.tr");

        if (!isEdu) {
          statusEl.textContent = "Sadece .edu / .edu.tr adresleri kabul edilir.";
          statusEl.classList.remove("ok");
          statusEl.classList.add("warn");
          return;
        }

        statusEl.textContent = "Kayıt tamamlandı (7.8 sn). Bölümünün en popüler 5 notu yüklendi.";
        statusEl.classList.remove("warn");
        statusEl.classList.add("ok");
      });
    }

    function renderUploadedFiles(files) {
      if (!uploadList) return;
      const items = Array.from(files || []);
      if (items.length === 0) return;

      if (uploadList.firstElementChild && uploadList.firstElementChild.textContent === "Henüz dosya yok.") {
        uploadList.innerHTML = "";
      }

      items.forEach(function (file) {
        const li = document.createElement("li");
        li.textContent = file.name + " (" + Math.ceil(file.size / 1024) + " KB)";
        uploadList.prepend(li);
      });
    }

    if (dropZone && fileInput) {
      function openPicker() {
        fileInput.click();
      }

      pickFilesBtn?.addEventListener("click", openPicker);

      dropZone.addEventListener("click", function (event) {
        if (event.target.id !== "pickFilesBtn") {
          openPicker();
        }
      });

      dropZone.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      });

      ["dragenter", "dragover"].forEach(function (type) {
        dropZone.addEventListener(type, function (event) {
          event.preventDefault();
          dropZone.classList.add("dragover");
        });
      });

      ["dragleave", "drop"].forEach(function (type) {
        dropZone.addEventListener(type, function (event) {
          event.preventDefault();
          dropZone.classList.remove("dragover");
        });
      });

      dropZone.addEventListener("drop", function (event) {
        const files = event.dataTransfer?.files;
        renderUploadedFiles(files);
      });

      fileInput.addEventListener("change", function () {
        renderUploadedFiles(fileInput.files);
      });
    }

    function filteredItems() {
      return noteItems.filter(function (item) {
        return item.style.display !== "none";
      });
    }

    function setSelectedByIndex(nextIndex) {
      const list = filteredItems();
      if (list.length === 0) return;

      const bounded = Math.max(0, Math.min(nextIndex, list.length - 1));
      selectedIndex = bounded;
      noteItems.forEach(function (item) {
        item.classList.remove("selected");
      });
      list[selectedIndex].classList.add("selected");
      list[selectedIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    if (noteSearch) {
      noteSearch.addEventListener("input", function () {
        const q = noteSearch.value.trim().toLowerCase();
        noteItems.forEach(function (item) {
          const text = item.dataset.title || "";
          const match = text.includes(q);
          item.style.display = match ? "flex" : "none";
        });
        selectedIndex = 0;
        setSelectedByIndex(0);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "/" && !isTypingTarget(event.target)) {
        event.preventDefault();
        noteSearch?.focus();
        return;
      }

      if (event.key.toLowerCase() === "g" && !isTypingTarget(event.target)) {
        gPressedAt = Date.now();
        return;
      }

      if (event.key.toLowerCase() === "d" && !isTypingTarget(event.target)) {
        if (Date.now() - gPressedAt < 1100) {
          dashboard?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (event.key.toLowerCase() === "j") {
        setSelectedByIndex(selectedIndex + 1);
      }

      if (event.key.toLowerCase() === "k") {
        setSelectedByIndex(selectedIndex - 1);
      }

      if (event.key === "Enter") {
        const current = filteredItems()[selectedIndex];
        const anchor = current?.querySelector("a");
        if (anchor) {
          anchor.click();
        }
      }
    });

    openCriticalHint?.addEventListener("click", function () {
      criticalHint?.classList.add("open");
      criticalHint?.setAttribute("aria-hidden", "false");
    });

    closeCriticalHint?.addEventListener("click", function () {
      criticalHint?.classList.remove("open");
      criticalHint?.setAttribute("aria-hidden", "true");
    });
  }

  function initNote() {
    const aiFab = qs("aiFab");
    const aiPanel = qs("aiPanel");
    const closeAiPanel = qs("closeAiPanel");
    const aiResults = qs("aiResults");
    const aiProgress = qs("aiProgress");

    const selectionMenu = qs("selectionMenu");
    const pdfContent = qs("pdfContent");

    const paywallDrawer = qs("paywallDrawer");
    const closePaywall = qs("closePaywall");

    const aiTryCount = qs("aiTryCount");
    const creditCount = qs("creditCount");

    const criticalModeCard = qs("criticalModeCard");
    const criticalHours = qs("criticalHours");
    const openCriticalMode = qs("openCriticalMode");
    const criticalOverlay = qs("criticalOverlay");
    const closeCriticalMode = qs("closeCriticalMode");

    const reportBtn = qs("reportBtn");

    const FREE_LIMIT = 4;
    let freeUses = parseInt(localStorage.getItem("sevenCampusAiUses") || "0", 10);
    let credits = parseInt(localStorage.getItem("sevenCampusCredits") || "50", 10);
    let selectedSnippet = "";

    const quickButtons = Array.from(document.querySelectorAll("[data-ai-action]"));

    function openAiPanel() {
      aiPanel?.classList.add("open");
      aiPanel?.setAttribute("aria-hidden", "false");
    }

    function hideAiPanel() {
      aiPanel?.classList.remove("open");
      aiPanel?.setAttribute("aria-hidden", "true");
    }

    function showPaywall() {
      paywallDrawer?.classList.add("open");
      paywallDrawer?.setAttribute("aria-hidden", "false");
    }

    function hidePaywall() {
      paywallDrawer?.classList.remove("open");
      paywallDrawer?.setAttribute("aria-hidden", "true");
    }

    function refreshCounters() {
      const left = Math.max(FREE_LIMIT - freeUses, 0);
      if (aiTryCount) aiTryCount.textContent = String(left);
      if (creditCount) creditCount.textContent = String(Math.max(credits, 0));
    }

    function createQuizMarkup() {
      const questions = [
        {
          q: "Türevde zincir kuralı hangi durumda kullanılır?",
          options: ["İç içe fonksiyonlarda", "Sabit fonksiyonda", "Yalnızca trigonometrik serilerde"],
          correct: 0,
        },
        {
          q: "Parçalı integralde ilk seçim genelde nasıl yapılır?",
          options: ["Daha kolay türevlenecek ifade seçilir", "Daha zor integral seçilir", "Rastgele seçilir"],
          correct: 0,
        },
        {
          q: "Geometrik seri yakınsaklığı için |r| koşulu nedir?",
          options: ["|r| < 1", "|r| > 2", "|r| = 2"],
          correct: 0,
        },
        {
          q: "Süreklilik için hangi şart gerekir?",
          options: ["Soldan limit = sağdan limit = fonksiyon değeri", "Sadece fonksiyon tanımlı olsun", "Sadece türevli olsun"],
          correct: 0,
        },
        {
          q: "Vizede hız için ilk adım ne olmalı?",
          options: ["Soru tipini tanıyıp yöntem seçmek", "Hemen işlem uzatmak", "En uzun çözümü yazmak"],
          correct: 0,
        },
      ];

      return questions
        .map(function (item, idx) {
          const options = item.options
            .map(function (opt, optIdx) {
              return (
                "<button class=\"quiz-option\" data-q=\"" +
                idx +
                "\" data-opt=\"" +
                optIdx +
                "\" data-correct=\"" +
                item.correct +
                "\">" +
                escapeHtml(opt) +
                "</button>"
              );
            })
            .join("");

          return (
            "<div class=\"quiz-question\"><h4>" +
            (idx + 1) +
            ". " +
            escapeHtml(item.q) +
            "</h4><div class=\"quiz-options\">" +
            options +
            "</div></div>"
          );
        })
        .join("");
    }

    function appendAiCard(title, body, action) {
      const card = document.createElement("article");
      card.className = "ai-card";

      if (action === "quiz") {
        card.innerHTML =
          "<h3>5 Soruluk Hızlı Test</h3>" +
          "<p>Nottan çekilen ana kavramlarla oluşturuldu. Yanlış cevaplar turuncu gösterilir.</p>" +
          createQuizMarkup() +
          "<p class=\"ai-disclaimer\">AI tarafından oluşturuldu, hata içerebilir — flag'la</p>";
      } else {
        card.innerHTML =
          "<h3>" +
          escapeHtml(title) +
          "</h3><p>" +
          escapeHtml(body) +
          "</p><p class=\"ai-disclaimer\">AI tarafından oluşturuldu, hata içerebilir — flag'la</p>";
      }

      aiResults?.prepend(card);
    }

    function runProgress(callback) {
      if (!aiProgress) {
        callback();
        return;
      }

      const s1 = qs("progressStep1");
      const s2 = qs("progressStep2");
      const s3 = qs("progressStep3");

      [s1, s2, s3].forEach(function (el) {
        el?.classList.remove("done");
      });

      aiProgress.hidden = false;
      setTimeout(function () {
        s1?.classList.add("done");
      }, 260);
      setTimeout(function () {
        s2?.classList.add("done");
      }, 760);
      setTimeout(function () {
        s3?.classList.add("done");
      }, 1220);
      setTimeout(function () {
        aiProgress.hidden = true;
        callback();
      }, 1640);
    }

    function runAiAction(action, text) {
      freeUses += 1;
      localStorage.setItem("sevenCampusAiUses", String(freeUses));
      refreshCounters();

      if (freeUses > FREE_LIMIT) {
        showPaywall();
        return;
      }

      credits -= 1;
      localStorage.setItem("sevenCampusCredits", String(credits));
      refreshCounters();

      openAiPanel();
      runProgress(function () {
        if (action === "quiz") {
          appendAiCard("5 Soruluk Hızlı Test", "", "quiz");
          return;
        }

        if (action === "summary") {
          appendAiCard(
            "1 Dakikalık Özet",
            "Vizede en kritik üç konu: türev kuralları, parçalı integral, yakınsaklık testi. Her konu için önce yöntem seç, sonra kısa işlem yolu izle.",
            action
          );
          return;
        }

        appendAiCard(
          "Açıklama",
          "Seçtiğin bölümde temel fikir şu: soruyu çözmeden önce hangi kuralın uygun olduğunu sınıflandırmak işlem hızını belirler. Bu yaklaşım sınav stresinde hata oranını düşürür.",
          action
        );
      });
    }

    function hideSelectionMenu() {
      selectionMenu?.classList.remove("show");
      selectionMenu?.setAttribute("aria-hidden", "true");
    }

    function showSelectionMenu(rangeRect) {
      if (!selectionMenu) return;

      selectionMenu.style.top = Math.max(rangeRect.top - 48, 8) + "px";
      selectionMenu.style.left = Math.max(rangeRect.left, 8) + "px";
      selectionMenu.classList.add("show");
      selectionMenu.setAttribute("aria-hidden", "false");
    }

    function handleTextSelection() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        hideSelectionMenu();
        return;
      }

      const text = selection.toString().trim();
      const anchorNode = selection.anchorNode;
      const insidePdf = anchorNode && pdfContent?.contains(anchorNode);

      if (!insidePdf || text.length < 3) {
        hideSelectionMenu();
        return;
      }

      selectedSnippet = text;
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      showSelectionMenu(rect);
    }

    function handleQuizOptionClick(target) {
      if (!target.classList.contains("quiz-option")) return;

      const parent = target.parentElement;
      if (!parent) return;

      const buttons = Array.from(parent.querySelectorAll(".quiz-option"));
      if (buttons.some(function (btn) { return btn.disabled; })) return;

      const selected = Number(target.dataset.opt);
      const correct = Number(target.dataset.correct);

      buttons.forEach(function (btn) {
        btn.disabled = true;
        if (Number(btn.dataset.opt) === correct) {
          btn.classList.add("correct");
        }
      });

      if (selected !== correct) {
        target.classList.add("wrong");
      }
    }

    function setupCriticalMode() {
      const examAt = document.body.dataset.examAt;
      if (!examAt || !criticalModeCard) return;

      const now = new Date();
      const examDate = new Date(examAt);
      const diffMs = examDate.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours > 0 && diffHours < 24) {
        criticalModeCard.hidden = false;
        if (criticalHours) criticalHours.textContent = String(diffHours);
      } else {
        criticalModeCard.hidden = true;
      }
    }

    function addSystemNote(message) {
      const card = document.createElement("article");
      card.className = "ai-card";
      card.innerHTML = "<h3>Sistem</h3><p>" + escapeHtml(message) + "</p>";
      aiResults?.prepend(card);
    }

    aiFab?.addEventListener("click", openAiPanel);
    closeAiPanel?.addEventListener("click", hideAiPanel);
    closePaywall?.addEventListener("click", hidePaywall);

    quickButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const action = button.getAttribute("data-ai-action") || "summary";
        const text = selectedSnippet || "Not";
        runAiAction(action, text);
        hideSelectionMenu();
      });
    });

    document.addEventListener("mouseup", function () {
      setTimeout(handleTextSelection, 0);
    });

    document.addEventListener("keyup", function () {
      setTimeout(handleTextSelection, 0);
    });

    document.addEventListener("mousedown", function (event) {
      const clickedMenu = selectionMenu?.contains(event.target);
      const clickedPdf = pdfContent?.contains(event.target);
      if (!clickedMenu && !clickedPdf) {
        hideSelectionMenu();
      }
    });

    aiResults?.addEventListener("click", function (event) {
      handleQuizOptionClick(event.target);
    });

    openCriticalMode?.addEventListener("click", function () {
      criticalOverlay?.removeAttribute("hidden");
    });

    closeCriticalMode?.addEventListener("click", function () {
      criticalOverlay?.setAttribute("hidden", "");
    });

    reportBtn?.addEventListener("click", function () {
      addSystemNote("İçerik raporu alındı. Moderasyon ekibi 24 saat içinde inceleyecek.");
      openAiPanel();
    });

    qs("audioBack")?.addEventListener("click", function () {
      addSystemNote("Podcast modu: 15 saniye geri sarıldı.");
    });

    qs("audioForward")?.addEventListener("click", function () {
      addSystemNote("Podcast modu: 15 saniye ileri sarıldı.");
    });

    refreshCounters();
    setupCriticalMode();

    document.addEventListener("keydown", function (event) {
      if (event.key === "/" && !isTypingTarget(event.target)) {
        event.preventDefault();
        pdfContent?.focus();
      }
    });
  }
})();
