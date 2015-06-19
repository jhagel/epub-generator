var method = Contentparser.prototype;

function Contentparser(html) {
    this._html = html;
}

method.removeEdit = function() {
  var self = this;
  var html = self._html;

  self._html = html.replace('[edit]', '');
};

module.exports = Contentparser;
