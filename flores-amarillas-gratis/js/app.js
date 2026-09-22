(() => {
  "use strict";
  const config = PAGE_CONFIG;
  const byId = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const svgNS = "http://www.w3.org/2000/svg";
  let ready = false;
  let opening = false;

  byId("recipient").textContent = `Para ${config.recipient}`;
  const heart = document.createElement("span");
  heart.className = "recipient-heart";
  heart.textContent = "♡";
  heart.setAttribute("aria-hidden", "true");
  byId("recipient").append(heart);
  byId("intro-text").textContent = config.intro.text;
  byId("button-text").textContent = config.intro.buttonText;
  byId("message-title").textContent = config.message.title;
  byId("dedication").textContent = config.message.text;
  byId("signature").textContent = config.message.signature;
  byId("hint").textContent = config.interaction.hint;

  function svgElement(tag, attributes = {}) {
    const element = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  // Posición, escala, pétalos y giro: siete siluetas con alturas distintas.
  const flowers = [
    { x: 153, y: 140, scale: .77, petals: 9, rotation: -17 },
    { x: 258, y: 83, scale: .74, petals: 11, rotation: 9 },
    { x: 326, y: 148, scale: .85, petals: 8, rotation: 22 },
    { x: 107, y: 212, scale: .62, petals: 7, rotation: -25 },
    { x: 216, y: 163, scale: 1.06, petals: 12, rotation: -5 },
    { x: 293, y: 222, scale: .94, petals: 10, rotation: 12 },
    { x: 177, y: 253, scale: .75, petals: 8, rotation: -12 }
  ];

  flowers.forEach((flower, index) => {
    byId("stems").append(svgElement("path", {
      d: `M${224 + index * 3} ${398 - index % 3 * 5} Q${flower.x + 15} 300 ${flower.x} ${flower.y}`
    }));
    const position = svgElement("g", { transform: `translate(${flower.x} ${flower.y}) scale(${flower.scale}) rotate(${flower.rotation})` });
    const button = svgElement("g", { class: "flower", role: "button", tabindex: "-1", "aria-label": `Acariciar flor ${index + 1}`, "aria-disabled": "true" });
    button.style.cssText = `--delay:${1 + index * .19}s;--duration:${3.8 + index * .43}s;--sway-delay:${-index * .7}s`;
    const sway = svgElement("g", { class: "flower-sway" });
    const bloom = svgElement("g", { class: "flower-bloom" });
    const pulse = svgElement("g", { class: "flower-pulse" });
    // Dos capas de pétalos, con leves asimetrías y una nervadura delicada.
    for (let layer = 0; layer < 2; layer++) {
      for (let petal = 0; petal < flower.petals; petal++) {
        const angle = petal * 360 / flower.petals + layer * 15;
        const petalGroup = svgElement("g", { transform: `rotate(${angle}) scale(${layer ? .82 : 1})` });
        petalGroup.append(svgElement("path", {
          d: "M-5 3C-19-10-20-34-10-43C-2-50 9-45 12-35C17-19 8-4 5 3Z",
          fill: layer ? "url(#petal)" : ["#eabe3d", "#f2cc53", "#e9bd37"][index % 3],
          stroke: "#cfa032", "stroke-width": ".35"
        }));
        petalGroup.append(svgElement("path", { d: "M0-8Q-3-23-3-35", stroke: "#fff0ad", "stroke-width": ".75", opacity: ".45", fill: "none" }));
        pulse.append(petalGroup);
      }
    }
    pulse.append(svgElement("circle", { r: 12, fill: "url(#center)" }));
    for (let dot = 0; dot < 19; dot++) {
      const angle = dot * 2.4;
      const radius = Math.sqrt(dot) * 2.1;
      pulse.append(svgElement("circle", { cx: Math.cos(angle) * radius, cy: Math.sin(angle) * radius, r: .95, fill: dot % 2 ? "#edcb66" : "#86662b", opacity: ".8" }));
    }
    button.append(svgElement("circle", { r: 54, class: "focus-ring" }));
    bloom.append(pulse);
    sway.append(bloom);
    button.append(sway);
    position.append(button);
    byId("flowers").append(position);
    let cooldown = false;
    function touchFlower() {
      if (!ready || cooldown) return;
      cooldown = true;
      pulse.classList.add("is-touched");
      const bounds = button.getBoundingClientRect();
      burst(bounds.x + bounds.width / 2, bounds.y + bounds.height / 3, 3);
      window.setTimeout(() => { pulse.classList.remove("is-touched"); cooldown = false; }, 650);
    }
    button.addEventListener("click", touchFlower);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); touchFlower(); }
    });
  });

  function burst(x, y, count, petals = false) {
    if (reducedMotion.matches) return;
    const container = byId("particles");
    for (let index = 0; index < count && container.childElementCount < 18; index++) {
      const particle = document.createElement("span");
      particle.className = petals ? "particle petal" : "particle";
      particle.textContent = petals ? "" : index % 2 ? "✦" : "♡";
      particle.style.cssText = `left:${x + (Math.random() - .5) * 65}px;top:${y + Math.random() * 20}px;--drift:${(Math.random() - .5) * 70}px`;
      container.append(particle);
      window.setTimeout(() => particle.remove(), 1800);
    }
  }

  byId("receive").addEventListener("click", () => {
    if (opening) return;
    opening = true;
    const intro = document.querySelector(".intro");
    intro.classList.add("leaving");
    window.setTimeout(() => {
      intro.hidden = true;
      const gift = byId("gift");
      gift.hidden = false;
      gift.classList.add("is-opening");
      const rect = byId("bouquet").getBoundingClientRect();
      burst(rect.x + rect.width / 2, rect.y + rect.height / 2, 7, true);
      window.setTimeout(() => {
        ready = true;
        document.querySelectorAll(".flower").forEach((flower) => {
          flower.setAttribute("tabindex", "0");
          flower.removeAttribute("aria-disabled");
        });
        byId("message-title").focus({ preventScroll: true });
      }, reducedMotion.matches ? 0 : 4100);
    }, reducedMotion.matches ? 0 : 350);
  });
})();
