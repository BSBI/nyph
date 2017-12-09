<div class="info-message">
  <p>Edit the record by clicking on the rows below. To add photos use the camera icon (bottom-left). Click the back icon (<) when you have finished.</p>
</div>
<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    
    <a href="#records/<%- obj.id %>/edit/taxon" title="click to change the species name" id="species-button" class="navigate-right">
      <span class="media-object pull-left icon"></span><span style="margin-left: 52px">Plant name</span>
        <% if (obj.commonName) { %>
      <span class="media-object pull-right descript"><%- obj.commonName %></span>
      <% } %>
      <span class="media-object pull-right descript"><i><%- obj.scientificName %></i></span>
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#records/<%- obj.id %>/edit/location" id="location-button"
       class="<%- obj.gridrefLock ? '' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-location" title="click to set the grid-reference"></span>

      <% if (obj.gridref) { %>
        <span class="media-object pull-right descript <%- obj.gridrefLock ? 'lock' : '' %>"><%= obj.gridref %></span>
      <% } else { %>
        <% if (obj.isLocating) { %>
          <span class="media-object pull-right descript warn">Locating...</span>
        <% } else { %>
          <span class="media-object pull-right descript error">Grid-reference missing</span>
        <% } %>
      <% } %>
      Location
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#records/<%- obj.id %>/edit/comment" id="comment-button"
       class="navigate-right">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.comment %></span>
      Comment
    </a>
  </li>
</ul>
