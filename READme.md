# TaskForge

> **Forge Your Tasks. Shape Your Productivity.**

TaskForge is an interactive task management application built using **HTML, CSS, and Vanilla JavaScript**. The project demonstrates practical usage of **DOM Manipulation**, **Event Handling**, **Event Delegation**, **Event Propagation**, **Attributes vs Properties** while providing a clean and responsive user experience.

#  Features

### Task Management

- Add new tasks
- Edit existing tasks
- Mark tasks as completed
- Delete tasks
- Search tasks
- Filter tasks by category
- Clear all tasks
- Pending & Completed task counters

### Theme

- Light/Dark mode toggle
- Theme persistence using Local Storage

### Browser & DOM Concepts

- Dynamic DOM creation
- Custom Data Attributes
- Event Delegation
- Event Bubbling
- Event Capturing


#  Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- Local Storage API
- Remix Icons

#  Browser Rendering Pipeline

Every webpage displayed in the browser goes through a rendering pipeline before it appears on the screen.

```text
                HTML
                  │
                  ▼
              Parsing
                  │
                  ▼
           Tokenization
                  │
                  ▼
              DOM Tree

                CSS
                  │
                  ▼
              Parsing
                  │
                  ▼
             CSSOM Tree
                  │
                  ▼
        DOM Tree + CSSOM Tree
                  │
                  ▼
             Render Tree
                  │
                  ▼
          Layout (Reflow)
                  │
                  ▼
          Paint (Rasterization)
                  │
                  ▼
     Composite & Display on Screen
```

## 1. Parsing

Parsing is the process where the browser reads the HTML and CSS source code and understands its structure.

Example:

```html
<h1>Hello</h1>
```

The browser recognizes:

- Opening tag
- Text node
- Closing tag

before converting them into objects that can be processed further.


## 2. Tokenization

During parsing, the browser breaks the HTML into smaller pieces called **tokens**.

For example,

```html
<h1>Hello</h1>
```

becomes:

- Start Tag Token (`<h1>`)
- Text Token (`Hello`)
- End Tag Token (`</h1>`)

These tokens are then used to build the DOM Tree.

## 3. DOM Tree

The **Document Object Model (DOM)** is a tree-like representation of all HTML elements.

Example:

```text
Document
│
└── html
    │
    ├── head
    │
    └── body
         │
         ├── h1
         └── button
```

JavaScript interacts with this tree using DOM APIs such as:

- `createElement()`
- `appendChild()`
- `remove()`
- `replaceWith()`

TaskForge dynamically creates, updates, and removes task cards by manipulating the DOM.

## 4. CSSOM Tree

The **CSS Object Model (CSSOM)** is created after the browser parses all CSS rules.

It stores styling information such as:

- Colors
- Fonts
- Margins & Padding
- Layout
- Animations

The CSSOM tells the browser how every DOM element should be styled.

## 5. Render Tree

The browser combines the **DOM Tree** and **CSSOM Tree** to create the **Render Tree**.

The Render Tree contains **only visible elements** that need to be displayed on the page.

Hidden elements (for example, those with `display: none`) are not included.

## 6. Layout

Once the Render Tree is created, the browser calculates the exact size and position of every visible element.

During this stage, the browser determines:

- Width and height
- Margins and padding
- Element positions
- Page layout

This process is known as **Layout** or **Reflow**.

## 7. Paint

After the layout is calculated, the browser paints each element onto different layers.

It draws:

- Text
- Background colors
- Borders
- Shadows
- Images
- Icons

This converts the calculated layout into pixels.

## 8. Composite & Display

Finally, the browser combines all painted layers together (compositing) and displays the finished webpage on the screen.

Whenever a task is added, edited, completed, or deleted in **TaskForge**, the browser updates the affected parts of the DOM and may perform layout, paint, and compositing again to display the latest changes efficiently.


#  Attributes vs Properties

Although they look similar, HTML Attributes and DOM Properties are different.

### Attributes

Attributes are defined in the HTML markup.

Example:

```html
<input value="Task">
```

JavaScript:

```javascript
input.getAttribute("value")
```

returns

```
Task
```

---

### Properties

Properties belong to the DOM object.

```javascript
input.value
```

always reflects the **current value** entered by the user.

If the user changes the input,

```javascript
input.value
```

updates immediately,

while

```javascript
input.getAttribute("value")
```

still returns the original HTML value unless updated explicitly.

TaskForge also uses custom data attributes:

- data-id
- data-status
- data-category

to store task-related metadata.


#  Event Bubbling

Event Bubbling is the default event propagation mechanism.

The event starts from the **target element** and moves upward through its ancestors.

Example:

```
Child
   ↓
Parent
   ↓
Grandparent
```

TaskForge includes an interactive demonstration showing the bubbling order.


#  Event Capturing

Event Capturing is the opposite of bubbling.

The event travels from the outermost ancestor down to the target element.

Example:

```
Grandparent
   ↓
Parent
   ↓
Child
```



#  Event Delegation

Instead of attaching separate event listeners to every task card, TaskForge uses **Event Delegation**.

A single event listener is attached to the parent task container.

Benefits:

- Better performance
- Less memory usage
- Automatically supports dynamically created task cards
- Cleaner and more maintainable code

---

#  DOM Methods Used

TaskForge demonstrates practical usage of the following DOM methods:

- createElement()
- createTextNode()
- append()
- appendChild()
- prepend()
- before()
- after()
- replaceWith()
- remove()

Other commonly used APIs include:

- querySelector()
- classList
- dataset
- getAttribute()
- setAttribute()
- hasAttribute()
- removeAttribute()

---

#  Local Storage

The application stores:

- Tasks
- Theme preference
- Task counter

using the Local Storage API so data remains available after refreshing the page.


---

*Created for Cohort 3.0 assignment.*

