<% if (obj.taxon) { %>
  <a href="#records/<%- obj.id %>/edit" class="mobile">
<% } else { %>
  <a href="#records/<%- obj.id %>/edit/taxon" class="mobile">
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
  <% if (obj.group) { %>
    <div class="group-status icon icon-users"></div>
  <% } %>
</div>

<div class="media-body">
  <div class="species"> <%= obj.taxonMobileName %></div>

  <% if (obj.location_gridref) { %>
     <div class="gridref"><%= obj.location_gridref %></div>
  <% } else { %>
      <% if (obj.isLocating) { %>
        <div class="location warn">Locating...</div>
      <% } else { %>
        <div class="location error">No grid reference</div>
      <% } %>
  <% } %>

  <div class="attributes">
    <div class="comment"><%= obj.comment %></div>
  </div>
</div>
</a>

<div class="mobile-swipe-edit">
<div class="delete icon icon-delete"></div>
</div>