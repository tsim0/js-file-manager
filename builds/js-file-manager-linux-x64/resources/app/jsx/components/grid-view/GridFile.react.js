var React = require('react');
var classNames = require('classnames');

var FileManagerActions = require('../../actions/FileManagerActions');
var CMActions = require('../../actions/ContextMenuActions');
var CMConstants = require('../../constants/ContextMenuConstants');
var FileManagerStore = require('../../stores/FileManagerStore');
var fileViewable = require('../../utils/FileViewable');
var DragImage = require('../../utils/DragImage');
var API = require('../../utils/API');

var gridDragImageView = require('./gridDragImageView');

class GridFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = FileManagerStore.getFile(props.id);    
  }

  componentDidMount() {
    FileManagerStore.addFileChangeListener(this.props.id, this._onChange.bind(this));
  }

  componentWillUnmount() {
    FileManagerStore.removeFileChangeListener(this.props.id);
  }

  render() {
  	var file = this.state;

    if (! fileViewable(file)) {
      return false;
    }

    var classes = classNames('grid-file-element', {
      'selected': file.selected
    });

    return (
      <div
        draggable='true'
        className={classes}
        id={file.id}
        onDragStart={this._onDragStart.bind(this)}
        onDragEnd={this._onDragEnd.bind(this)}
        onMouseDown={this._onMouseDown.bind(this)}
        onDoubleClick={this._onDoubleClick.bind(this)}
        onContextMenu={this._onContextMenu.bind(this)} >
        <img draggable='false' src={file.thumbSrc} />
        <p>{file.filename}</p>
  		</div>
  	)
  }

  _onDragStart(e) {
    e.dataTransfer.dropEffect = 'move';
    e.dataTransfer.setData('text/plain', API.fileUrl(this.state.path));

    var dragImage = gridDragImageView(FileManagerStore.getSelectedFiles());
    var dragImageNode = DragImage.set(dragImage);
    e.dataTransfer.setDragImage(dragImageNode, 0, 0);
  }

  _onDragEnd() {
    DragImage.clear();
  }

  _onMouseDown() {
    if (! this.state.selected) {
      FileManagerActions.unselectAllFiles();
      FileManagerActions.setFileSelection(this.state.id, true);
    }
  }

  _onDoubleClick() {
    FileManagerActions.openFile(this.state.id);
  }

  _onContextMenu(e) {
    if (! this.state.selected) {
      FileManagerActions.unselectAllFiles();
      FileManagerActions.setFileSelection(this.props.id, true);
    }

    CMActions.open(e.pageY, e.pageX);
  }

  _onChange() {
    this.setState(FileManagerStore.getFile(this.props.id));
  }
}

module.exports = GridFile;