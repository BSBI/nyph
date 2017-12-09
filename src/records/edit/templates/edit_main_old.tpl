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
       class="<%- obj.locks['location'] || obj.locks['location_name'] ? '' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-location" title="click to set the place name or grid-reference"></span>

      <% if (obj.location_name) { %>
      <span class="media-object pull-right descript <%- obj.locks['location_name'] ? 'lock' : '' %>"><%= obj.location_name %></span>
      <% } else { %>
      <span class="media-object pull-right descript error">Name missing</span>
      <% } %>

      <% if (obj.location) { %>
      <span class="location media-object pull-right descript <%- obj.locks['location'] ? 'lock' : '' %>"><%- obj.location %></span>
      <% } else { %>
      <% if (obj.isLocating) { %>
      <span class="media-object pull-right descript warn">Locating...</span>
      <% } else { %>
      <span class="media-object pull-right descript error">Location missing</span>
      <% } %>
      <% } %>
      Location
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#records/<%- obj.id %>/edit/comment" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.comment %></span>
      Comment
    </a>
  </li>
</ul>
