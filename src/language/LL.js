/* eslint-disable quotes */
class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }

  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;
      while (tempNode.next !== null) {
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, null);
    }
  }

  insertAt(nthPosition, itemToInsert) {
    if (nthPosition < 0) {
      throw new Error("Position error");
    }
    if (nthPosition === 0) {
      this.insertFirst(itemToInsert);
    } else {
      const node = this._findNthElement(nthPosition - 1);
      const newNode = new _Node(itemToInsert, null);
      newNode.next = node.next;
      node.next = newNode;
    }
  }
  _findNthElement(position) {
    let node = this.head;
    for (let i = 0; i < position; i++) {
      node = node.next;
    }
    return node;
  }
  remove(item) {
    if (!this.head) {
      return null;
    }

    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }

    let currNode = this.head;

    let previousNode = this.head;
    while (currNode !== null && currNode.value !== item) {
      previousNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log("Item not found");
      return;
    } else {
      previousNode.next = currNode.next;
    }
  }
}

module.exports = LinkedList;
