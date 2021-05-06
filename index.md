
<link rel="stylesheet" type="text/css" href="semantic.min.css">
<script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
<script src="semantic.min.js"></script>


<select id="example-getting-started" multiple="multiple"><script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
    <option value="cheese">Cheese</option>
    <option value="tomatoes">Tomatoes</option>
    <option value="mozarella">Mozzarella</option>
    <option value="mushrooms">Mushrooms</option>
    <option value="pepperoni">Pepperoni</option>
    <option value="onions">Onions</option>
</select>

<select name="skills" multiple="" class="ui fluid dropdown" id="example-getting-started2">
  <option value="">Skills</option>
<option value="angular">Angular</option>
<option value="css">CSS</option>
<option value="design">Graphic Design</option>
<option value="ember">Ember</option>
<option value="html">HTML</option>
<option value="ia">Information Architecture</option>
<option value="javascript">Javascript</option>
<option value="mech">Mechanical Engineering</option>
<option value="meteor">Meteor</option>
<option value="node">NodeJS</option>
<option value="plumbing">Plumbing</option>
<option value="python">Python</option>
<option value="rails">Rails</option>
<option value="react">React</option>
<option value="repair">Kitchen Repair</option>
<option value="ruby">Ruby</option>
<option value="ui">UI Design</option>
<option value="ux">User Experience</option>
</select>

<table id="table_id" class="display">
    <thead>
        <tr>
            <th>Column 1</th>
            <th>Column 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Row 1 Data 1</td>
            <td>Row 1 Data 2</td>
        </tr>
        <tr>
            <td>Row 2 Data 1</td>
            <td>Row 2 Data 2</td>
        </tr>
    </tbody>
</table>

<script>
$(document).ready( function () {
 $('.ui fluid dropdown').dropdown();
 
 fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states", {

  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
}).then(response => response.json())
  .then(data => {console.log(data);
  data["states"].forEach((index, state) => {
  console.log(index, state);
  return;
  })
  });
  
  
    
} );    
</script>

## Welcome to GitHub Pages

You can use the [editor on GitHub](https://github.com/lihas/vaccinetracker/edit/gh-pages/index.md) to maintain and preview the content for your website in Markdown files.

Whenever you commit to this repository, GitHub Pages will run [Jekyll](https://jekyllrb.com/) to rebuild the pages in your site, from the content in your Markdown files.

### Markdown

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/lihas/vaccinetracker/settings/pages). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://support.github.com/contact) and we’ll help you sort it out.



