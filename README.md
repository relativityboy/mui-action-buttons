# @Relativity - Action Buttons for MUI

![Tests](https://github.com/relativityboy/mui-action-buttons/actions/workflows/ci.yml/badge.svg)

If you want low-key responsiveness to api calls or user actions that should give the user "just a little" feedback
these buttons should be perfect for you.

`npm install @relativity/mui-action-buttons`

The first button I've implemented is the `AIconButton`. It takes a string, and an `endIcon` or `startIcon` prop.

Example save button: 
```tsx
import { AIconButton } from "@relativity/mui-action-buttons"
import "@relativity/mui-action-buttons/styles.css"

async function handleSave() {
    //your fancy long-running code goes here
    await new Promise(r => setTimeout(r, 3000))
    return true
}

//...

<AIconButton 
    endIcon={<SaveIcon/>} 
    onClick={handleSave()}
    >SAVE
</AIconButton>
```

![save.png](https://raw.githubusercontent.com/relativityboy/mui-action-buttons/main/docs/img/save.png)

For async calls, a spinner replaces the icon you passed in until it completes. 

![spinning.png](https://raw.githubusercontent.com/relativityboy/mui-action-buttons/main/docs/img/spinning.png)

If you click a button and the handler completes without error, the button gets a checkmark & changes color for 2 seconds.

![success.png](https://raw.githubusercontent.com/relativityboy/mui-action-buttons/main/docs/img/success.png)

If the handler throws an error, the button turns red, and displays a warning icon until clicked again.

![error.png](https://raw.githubusercontent.com/relativityboy/mui-action-buttons/main/docs/img/error.png)

