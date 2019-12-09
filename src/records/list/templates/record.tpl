<% if (obj.taxon) { %>
  <a href="#records/<%- obj.id %>/edit">
<% } else { %>
  <a href="#records/<%- obj.id %>/edit/taxon">
<% } %>

    <div class="media-object pull-left photo">
      <% if (obj.idIncomplete) { %>
      <div class="taxonphotomessage">photo required</div>
      <% } else { %>
      <%= obj.img %>
      <% } %>
    </div>
    <div class="pull-right">
      <% if (obj.isSynchronising) { %>
         <div class="online-status icon icon-plus spin"></div>
      <% } else { %>
         <div class="online-status icon <%- obj.onDatabase ? 'icon-send cloud' : 'local' %>">
             <% if (!obj.onDatabase) { %><div style="font-size: 50%;">not yet sent</div><% } %>
         </div>
      <% } %>

      <div class="edit">
        <% if (!obj.onDatabase && !obj.isSynchronising) { %>
          <% if (obj.taxon) { %>
          <div data-attr="location" title="edit location" class="js-attr icon icon-location"></div>
          <div data-attr="comment" title="edit comment" class="js-attr icon icon-comment"></div>
          <% } %>
        <% } %>
        <div title="delete record" class="delete icon icon-cancel"></div>
      </div>
    </div>

    <div class="media-body">
      <div class="species"> <%= obj.taxon.formatted ? obj.taxon.formatted : 'missing species' %></div>

      <% if (obj.location_gridref) { %>
        <div class="gridref"><%= obj.location_gridref %><% if (obj.location_precision_bad) { %>
                                                              <div class="location error">2km or better precision required</div>
                                                              <% } %></div>
      <% } else { %>
        <% if (obj.isLocating) { %>
          <div class="location warn">Locating...</div>
        <% } else { %>
          <div class="location error">No grid reference</div>
        <% } %>
      <% } %>
      <% if (obj.recorder && window.nyphAdminMode) { %>
        <div class="recorder"><%= obj.recorder %></div>
      <% } %>

      <div class="attributes">
        <div class="comment"><%= obj.comment %></div>
      </div>
    </div>
  </a>
