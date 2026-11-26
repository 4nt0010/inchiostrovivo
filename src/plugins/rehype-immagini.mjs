// Immagini dentro gli articoli:
//  - caricamento differito e versioni ridotte (srcset)
//  - più immagini consecutive vengono raggruppate in una galleria
//  - una riga in corsivo subito sotto un'immagine diventa la didascalia
import { immagine, srcset } from "../lib/immagini.mjs";

const soloImmagini = (n) =>
  n.type === "element" &&
  n.tagName === "p" &&
  n.children.some((c) => c.tagName === "img") &&
  n.children.every((c) => c.tagName === "img" || (c.type === "text" && !c.value.trim()));

const didascalia = (n) =>
  n &&
  n.type === "element" &&
  n.tagName === "p" &&
  n.children.filter((c) => !(c.type === "text" && !c.value.trim())).length === 1 &&
  n.children.find((c) => c.tagName === "em");

function sistemaImg(img) {
  const src = img.properties.src || "";
  img.properties.src = immagine(src, 1600);
  const set = srcset(src);
  if (set) {
    img.properties.srcset = set;
    img.properties.sizes = "(min-width: 760px) 720px, 100vw";
  }
  img.properties.loading = "lazy";
  img.properties.decoding = "async";
  if (img.properties.alt === undefined) img.properties.alt = "";
}

function trasforma(children) {
  const out = [];
  let i = 0;
  while (i < children.length) {
    const n = children[i];
    if (soloImmagini(n)) {
      const gruppo = [];
      let j = i;
      while (j < children.length) {
        if (soloImmagini(children[j])) {
          gruppo.push(...children[j].children.filter((c) => c.tagName === "img"));
          j++;
        } else if (children[j].type === "text" && !children[j].value.trim()) {
          j++;
        } else break;
      }
      gruppo.forEach(sistemaImg);
      let cap = null;
      if (didascalia(children[j])) {
        cap = children[j].children.find((c) => c.tagName === "em").children;
        j++;
      }
      const corpo = [];
      if (gruppo.length > 1) {
        corpo.push({ type: "element", tagName: "div", properties: { className: ["galleria"] }, children: gruppo });
      } else {
        corpo.push(gruppo[0]);
      }
      if (cap) corpo.push({ type: "element", tagName: "figcaption", properties: {}, children: cap });
      out.push({
        type: "element",
        tagName: "figure",
        properties: { className: gruppo.length > 1 ? ["figura", "figura-galleria"] : ["figura"] },
        children: corpo,
      });
      i = j;
    } else {
      out.push(n);
      i++;
    }
  }
  return out;
}

export default function rehypeImmagini() {
  return (tree) => {
    tree.children = trasforma(tree.children);
  };
}
