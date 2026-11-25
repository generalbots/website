(() => {
  const dialog = document.querySelector("#lite-lightbox");
  if (!dialog || typeof dialog.showModal !== "function") {
    return;
  }

  const links = [...document.querySelectorAll(".lite-page .lite-image-open")];
  const viewport = dialog.querySelector(".lite-lightbox-viewport");
  const caption = dialog.querySelector("figcaption");
  const count = dialog.querySelector(".lite-lightbox-count");
  const zoom = dialog.querySelector("[data-lightbox-zoom]");
  const close = dialog.querySelector("[data-lightbox-close]");
  const image = new Image();
  image.alt = "";
  viewport.append(image);

  let index = 0;
  let trigger;
  let pressedBackdrop = false;

  function setZoom(active) {
    viewport.classList.toggle("is-zoomed", active);
    zoom.setAttribute("aria-pressed", String(active));
    viewport.scrollTo(0, 0);
  }

  function showImage(position) {
    index = (position + links.length) % links.length;
    const screenshot = links[index].querySelector("img");
    setZoom(false);
    image.src = screenshot.currentSrc || screenshot.src;
    caption.textContent = screenshot.alt;
    const format = new Intl.NumberFormat(document.documentElement.lang);
    count.textContent = format.format(index + 1) + " / " + format.format(links.length);
  }

  links.forEach((link, position) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", event => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      trigger = link;
      showImage(position);
      dialog.showModal();
    });
  });

  dialog.querySelector("[data-lightbox-prev]").addEventListener("click", () => showImage(index - 1));
  dialog.querySelector("[data-lightbox-next]").addEventListener("click", () => showImage(index + 1));
  zoom.addEventListener("click", () => setZoom(!viewport.classList.contains("is-zoomed")));
  close.addEventListener("click", () => dialog.close());

  dialog.addEventListener("keydown", event => {
    if (event.target === viewport && viewport.classList.contains("is-zoomed")) {
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showImage(index + (event.key === "ArrowRight" ? 1 : -1));
    }
  });

  dialog.addEventListener("pointerdown", event => {
    pressedBackdrop = event.target === dialog;
  });
  dialog.addEventListener("click", event => {
    if (pressedBackdrop && event.target === dialog) {
      dialog.close();
    }
    pressedBackdrop = false;
  });

  dialog.addEventListener("close", () => {
    trigger?.focus({preventScroll: true});
  });
})();
