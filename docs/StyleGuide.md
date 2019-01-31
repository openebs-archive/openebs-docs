

# Documentation Style Guide

## Markdown Syntax used at CloudByte

### Text

Syntax | Description
------------ | -------------
\*text\*  | Use before and after text for the text to appear in italics. Used to describe filenames, book titles, periodicals, and other materials. It is the equivalent of the HTML "cite" element. For example: \*\*text**
\`\`\`code text \`\`\` | Use ```before and after text for code samples, commands, and command output
\# | Heading 1
\#\#  | Heading 2 - Appear in the right pane TOC
\#\#\#  |  Heading 3 - Appear in the right pane TOC
\*\*Note:**  |  \*\*Note:** with a line space after that.


### UI Elements

Syntax | Description
------------ | -------------
\*\*  | Use before and after UI button names, menu items, and any UI elements that you refer in the documents for the text to appear in bold.


### Ordered and Unordered Lists

Syntax | Description
------------ | -------------
\*  | Use * space followed by text for unordered list.
1 |  Use number, full stop and a space followed by text for ordered list.


Example:
* text
* text
  * sub text  
  * sub text


1. Item 1
2. Item 2
3. Item 3
   * Item 3a
   * Item 3b

### Images and Figures

Syntax | Description
------------ | -------------
![image](/docs/assets/das-nas-cas.png) | Include the path where the image is located in the round brackets.


### Links

Syntax | Description
------------ | -------------
http://github.com | Specify just the URL name to directly access the website. Here the URL link is visible.
[GitHub](http://github.com)  | In this example clicking on GitHub will take you to the website while the URL link is hidden.




Prerequisite
Prerequisite/s:
------------

See Also:  Heading 3
Links below this section  Heading 4


Hyperlinks
.. _a link: http://example.com/
This is a paragraph that contains `a link`_.


Internal Cross Ref

:doc:`/reference/ha`
:doc:`system requirements <system_requirements>` :ref:`config-configure-ssh`
See `Name of the title`_
Commenting out
.. text
..
text… (for block commenting)
Back end/back-end should be used as backend

Dockerfile
A Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image.
OpenEBS
YAMLs
human-readable data serialization language
Go
Open source programming language
iSCSI
Internet Small Computer System Interface

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
