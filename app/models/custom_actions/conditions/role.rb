#-- encoding: UTF-8

#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2017 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2017 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

class CustomActions::Conditions::Role < CustomActions::Conditions::Base
  def self.key
    :role
  end

  def self.custom_action_scope(work_packages, user)
    has_current_role = CustomAction
                       .includes(:roles)
                       .where(custom_actions_roles: { role_id: roles_in_project(work_packages, user) })
    has_no_role = CustomAction
                  .includes(:roles)
                  .where(custom_actions_roles: { role_id: nil })

    has_current_role
      .or(has_no_role)
  end

  def self.getter(custom_action)
    ids = custom_action.role_ids

    new(ids) if ids.any?
  end

  def fulfilled_by?(work_package, user)
    values.empty? ||
      (self.class.roles_in_project(work_package, user).map(&:id) & values).any?
  end

  def self.roles_in_project(work_packages, user)
    ::Role
      .joins(:members)
      .where(members: { project_id: Array(work_packages).map(&:project_id).uniq, user_id: user.id })
      .select(:id)
  end

  private

  def associated
    ::Role
      .givable
      .select(:id, :name)
      .map { |u| [u.id, u.name] }
  end
end