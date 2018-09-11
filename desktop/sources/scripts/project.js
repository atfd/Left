"use strict";

function Project()
{
  this.pages = [new Splash()]

  this.index = 0;
  this.original = "";

  // ========================

  this.add = function(path = null)
  {
    let page;

    if(path){
      if(this.paths().indexOf(path) > -1){ console.warn(`Already open: ${path}`); return; }
      page = new Page(this.load(path),path);
    }
    
    this.pages.push(page);
  }

  this.update = function()
  {
    if(!this.pages[this.index]){ console.warn("Missing page"); return; }
    this.pages[this.index].text = left.textarea_el.value;
  }

  this.load = function(path)
  {
    console.log(`Load: ${path}`)

    let data;
    try {
      data = fs.readFileSync(path, 'utf-8');
    } catch (err) {
      alert("An error ocurred reading the file :" + err.message);
      return;
    }
    return data;
  }

  // ========================

  this.new = function()
  {
    console.log("New Page");

    this.remove_splash();

    this.add();

    setTimeout(() => { left.navi.next_page(); left.refresh(); left.textarea_el.focus(); },200);
  }

  this.open = function()
  {
    console.log("Open Pages");

    let paths = dialog.showOpenDialog(app.win, {properties: ['openFile','multiSelections']});

    if(!paths){ console.log("Nothing to load"); return; }

    this.remove_splash();

    for(let id in paths){
      this.add(paths[id])
    }

    setTimeout(() => { left.navi.next_page(); left.refresh(); left.textarea_el.focus(); },200);
  }

  this.save = function()
  {
    console.log("Save Page");

    let page = this.pages[this.index]

    if(!page.path){ this.save_as(); return; }

    fs.writeFile(page.path, page.text, (err) => {
      if(err) { alert("An error ocurred updating the file" + err.message); console.log(err); return; }

      page.commit();
      left.refresh();
      setTimeout(() => { left.stats.el.innerHTML = `<b>Saved</b> ${page.path}`; },200);
    });
  }

  this.save_as = function()
  {
    console.log("Save As Page");

    let page = this.pages[this.index]
    let path = dialog.showSaveDialog(app.win);

    if(!path){ console.log("Nothing to save"); return; }

    fs.writeFile(path, page.text, (err) => {
      if(err){ alert("An error ocurred creating the file "+ err.message); return; }

      if(!page.path){
        page.path = path;
      }
      else if(page.path != path){
        left.project.pages.push(new Page(page.text,path))
      }
      page.commit();
      left.refresh();
      setTimeout(() => { left.stats.el.innerHTML = `<b>Saved</b> ${page.path}`; },200);
    });
  }

  this.close = function()
  {
    if(this.pages.length == 1){ console.warn("Cannot close"); return; }

    if(this.pages[this.index].has_changes()){
      let response = dialog.showMessageBox(app.win, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to discard changes?',
        icon: `${app.path()}/icon.png`
      });
      if(response !== 0){
        return;
      }
    }
    this.force_close();
  }

  this.force_close = function()
  {
    if(this.pages.length == 1){ console.warn("Cannot close"); return; }

    console.log("Closing..")

    this.pages.splice(this.index,1);
    left.go.to_page(this.index-1);
  }

  this.discard = function()
  {
    let response = dialog.showMessageBox(app.win, {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to discard changes?',
      icon: `${app.path()}/icon.png`
    });
    if (response === 0) { // Runs the following if 'Yes' is clicked
      this.pages[this.index].revert();
      left.textarea_el.value = this.pages[this.index].text;
      left.refresh();
    }
  }

  this.has_changes = function()
  {
    for(let id in this.pages){
      if(this.pages[id].has_changes()){ return true;}
    }
    return false;
  }

  this.quit = function()
  {
    if(this.has_changes()){
      this.quit_dialog();
    }
    else{
      app.exit()
    }
  }

  this.quit_dialog = function()
  {
    let response = dialog.showMessageBox(app.win, {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Unsaved data will be lost. Are you sure you want to quit?',
      icon: `${app.path()}/icon.png`
    });
    if (response === 0) {
      app.exit()
    }
  }

  this.remove_splash = function()
  {
    for(let id in this.pages){
      let page = this.pages[id];
      if(page.text == new Splash().text){
        this.pages.splice(0,1);
      }
    }
  }

  this.paths = function()
  {
    let a = []
    for(let id in this.pages){
      let page = this.pages[id];
      if(page.path){ a.push(page.path); }
    }
    return a
  }

  function is_json(text){ try{ JSON.parse(text); return true; } catch (error){ return false; } }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}
