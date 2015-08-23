import Entry from './Entry';

export default class Template {
  constructor() {
    this.path = '';
    this.content = '';
  }

  entries() {
    return [new Entry()];
  }
}
