var debugPanel;

debugPanel = (function() {
  "use strict";
  var debugPanel;
  var updateDebug;
  var seq;
  updateDebug = function() {
    var stringz = '';
    if ('undefined' !== typeof seq) {
      for (var i = 0, keys = Object.keys(seq.looper); i < keys.length; i++) {
        stringz += keys[i] + ' : ' + seq.looper[keys[i]] + '\n';
      }
      debugPanel.childNodes[2].innerText = '';
      debugPanel.childNodes[2].innerText = stringz;
    }
  };

  return {
    loadDebugPanel: function(sequencerInstance) {
      var minimize, content, refresh;
      seq = sequencerInstance;
      debugPanel = document.createElement('div');
      debugPanel.id = 'debug-panel';
      document.body.insertBefore(debugPanel, document.body.children[0]);
      content = document.createElement('div');
      content.className = 'debug-content';
      minimize = document.createElement('div');
      minimize.innerText = 'minimize';
      minimize.style.float = 'right';
      minimize.style['margin-left'] = '5px';
      minimize.style.cursor = 'default';
      minimize.addEventListener('click', function() {
        if (!debugPanel.classList.contains('minimized')) {
          debugPanel.classList.add('minimized');
        } else {
          debugPanel.classList.remove('minimized');
        }
      });
      refresh = document.createElement('div');
      refresh.innerText = 'refresh';
      refresh.style.float = 'right';
      refresh.style['margin-left'] = '5px';
      refresh.style.cursor = 'default';
      refresh.addEventListener('click', function() {

        updateDebug();
      });
      debugPanel.appendChild(minimize);
      debugPanel.appendChild(refresh);
      debugPanel.appendChild(content);
    }
  };
})();



