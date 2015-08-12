var React = require('react');
var classNames = require('classnames');

var FileManagerActions = require('../../actions/FileManagerActions');
var ContextMenuActions = require('../../actions/ContextMenuActions');
var FileManagerStore = require('../../stores/FileManagerStore');
var makeDragImage = require('../../utils/makeDragImage');
var fileViewable = require('../../utils/FileViewable');
var API = require('../../utils/API');

class GridFolder extends React.Component {
  constructor(props) {
    super(props);
    this.state = FileManagerStore.getFile(props.id);

    this.dragEnterCounter = 0;
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

    var classes = classNames(
      'grid-folder-element',
      'btn', 'btn-default', 'btn-raised', {
      'selected': file.selected,
      'drag-over': file.dragOver
    });

    return (
      <a
        draggable='true'
        title={file.filename}
        id={this.props.id}
        onDragStart={this._onDragStart.bind(this)}
        onDragEnter={this._onDragEnter.bind(this)}
        onDragLeave={this._onDragLeave.bind(this)}
        onDrop={this._onDrop.bind(this)}
        onMouseDown={this._onMouseDown.bind(this)}
        onClick={this._onClick.bind(this)}
        onContextMenu={this._onContextMenu.bind(this)}
        className={classes}>
        <i
          className='pull-left mdi-file-folder mdi-material-grey'
          draggable='false'></i>
        {file.filename}
      </a>
    )
  }

  _onChange() {
    this.setState(FileManagerStore.getFile(this.props.id));
  }

  _onMouseDown() {
    if (! this.state.selected) {
      FileManagerActions.unselectAllFiles();
      FileManagerActions.setFileSelection(this.state.id, true);
    }
  }

  _onClick() {
    FileManagerActions.changePath(this.state.path);
  }

  _onDragStart(e) {
    e.dataTransfer.dropEffect = 'move';
    e.dataTransfer.setData('text/plain', API.directoryUrl(this.state.path));

    var dragImage = makeDragImage(FileManagerStore.getSelectedFiles());
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  _onDragEnter(e) {
    e.preventDefault();

    if (this.dragEnterCounter++ === 0) {
      this.setState({dragOver: true});
    }
  };

  _onDragLeave(e) {
    e.preventDefault();

    if (--this.dragEnterCounter === 0) {
      this.setState({dragOver: false});
    }
  };

  _onDrop(e) {
    this.setState({dragOver: false});

    FileManagerStore.getSelectedFiles()
      .forEach(f => FileManagerActions.moveFileToDir(f, this.state.path));

    e.preventDefault();
  };

  _onContextMenu(e) {    
    if (! this.state.selected) {
      FileManagerActions.unselectAllFiles();
    }

    FileManagerActions.setFileSelection(this.props.id, true);

    ContextMenuActions.open(e.pageY, e.pageX);
    e.stopPropagation();
  }
}

module.exports = GridFolder;