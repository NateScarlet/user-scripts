export default interface Component {
  readonly render: () => void;
  readonly dispose: () => void;
}
