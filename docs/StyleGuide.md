

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
\*\*  | Use before and after text for the text to appear in bold. Button Names, Menu Items, and any UI element that you refer must be in this format.


### Ordered and Unordered Lists

Syntax | Description
------------ | -------------
1. | Use number 1. space followed by text for ordered list. 
\*  | Use * space followed by text for unordered list.

Example: 
* Item 1
* Item 2

1. Item 1
2. Item 2
3. Item 3
   * Item 3a
   * Item 3b

### Images and Figures

Syntax | Description
------------ | -------------

### Links

Syntax | Description
------------ | -------------
http://github.com | Specify just the URL name to directly access the website.
[GitHub](http://github.com)  | In this example clicking on GitHub will take you to the website while the URL link is hidden.


Including Images/figures
.. image:: _path/name.png
.. figure:: /_path/ figures name.png
Including filename
.. include:: ../filename.rst
 
Prerequisite
Prerequisite/s:
------------
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
Glossary
Terms
Description
Terms
Description
Dockerfile
A Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image.
OpenEBS
YAMLs
human-readable data serialization language
Go
Open source programming language
iSCSI
Internet Small Computer System Interface
