// Un link YouTube da solo su una riga diventa un video incorporato.
// Il video vero si carica solo quando si preme "Riproduci" (più veloce e
// nessun cookie di YouTube finché il lettore non lo sceglie).
import { visit } from "unist-util-visit";

const RE = /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/;

function testo(nodo) {
  if (nodo.type === "text") return nodo.value;
  if (nodo.children) return nodo.children.map(testo).join("");
  return "";
}

export default function remarkVideo() {
  return (tree) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || node.children.length !== 1) return;
      const figlio = node.children[0];
      const url = (figlio.type === "link" ? figlio.url : testo(figlio)).trim();
      const m = url.match(RE);
      if (!m) return;
      const id = m[1];
      parent.children[index] = {
        type: "html",
        value:
          `<div class="video"><a class="video-anteprima" href="https://www.youtube.com/watch?v=${id}" data-yt="${id}">` +
          `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async" width="480" height="360">` +
          `<span class="video-pulsante">Riproduci il video</span></a></div>`,
      };
    });
  };
}
