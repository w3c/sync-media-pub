export default class Utils {

    startSourceChunk(lvl, parent) {
        let span = document.createElement("span");
        let pre = document.createElement("pre");
        let padding = "    ";
        pre.textContent = `${padding.repeat(lvl)}{\n${padding.repeat(lvl+1)}"narration": [`;
        span.appendChild(pre);
        parent.appendChild(span);
    }
  
    closeSourceChunk(lvl, parent) {
        let span = document.createElement("span");
        let pre = document.createElement("pre");
        let padding = "    ";
        pre.textContent = `${padding.repeat(lvl+1)}]\n${padding.repeat(lvl)}}`;
        span.appendChild(pre);
        parent.appendChild(span);
    }
  
    makeSourceChunk(item, lvl, parent) {
        let span = document.createElement("span");
        let textid = item.text.split("#")[1];
        span.id = `src_${textid}`;
        let pre = document.createElement("pre");
        let padding = "    ".repeat(lvl);
        pre.textContent = `${padding}${JSON.stringify(item)},`;
        span.appendChild(pre);
        parent.appendChild(span);
    }
  
    makeCheckbox(id, label, parent) {
        let chk = document.createElement("input");
        chk.id = id;
        
        let chk_label = document.createElement("label");
        chk_label.id = `${id}_label`;
        chk_label.for = id;
        chk_label.textContent = label;
        chk.type = "checkbox";
        
        parent.appendChild(chk);
        parent.appendChild(chk_label);
        return chk;
    }
  
    makeButton(label, parent) {
        let button = document.createElement("button");
        button.textContent = label;
        parent.append(button);
        return button;
    }

    loadSource(sourceJson, lvl) {
        this.startSourceChunk(lvl, source);
        
        sourceJson.narration.map(item => {
          if (item.hasOwnProperty("narration")) {
            this.loadSource(item, lvl+2);
          }
          else {
            this.makeSourceChunk(item, lvl+2, source);
          }
        });
      
        this.closeSourceChunk(lvl, source);
    }
}