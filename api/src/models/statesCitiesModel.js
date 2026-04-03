const pool = require('../config/database');

class StatesCitiesModel {
  static async getAllStates() {
    const result = await pool.query(
      "SELECT id, name FROM states_cities WHERE type='state' AND is_active=true ORDER BY name ASC"
    );
    return result.rows;
  }

  static async getCitiesByState(stateId) {
    const result = await pool.query(
      "SELECT id, name FROM states_cities WHERE type='city' AND parent_id=$1 AND is_active=true ORDER BY name ASC",
      [stateId]
    );
    return result.rows;
  }

  static async getAllCities() {
    const result = await pool.query(
      "SELECT sc.id, sc.name, sc.parent_id, s.name AS state_name FROM states_cities sc JOIN states_cities s ON sc.parent_id=s.id WHERE sc.type='city' AND sc.is_active=true ORDER BY s.name, sc.name ASC"
    );
    return result.rows;
  }

  static async searchCities(query) {
    const result = await pool.query(
      "SELECT sc.id, sc.name, sc.parent_id, s.name AS state_name FROM states_cities sc JOIN states_cities s ON sc.parent_id=s.id WHERE sc.type='city' AND sc.is_active=true AND sc.name ILIKE $1 ORDER BY sc.name ASC LIMIT 20",
      [`%${query}%`]
    );
    return result.rows;
  }

  static async createState(name) {
    const result = await pool.query(
      "INSERT INTO states_cities (name, type) VALUES ($1, 'state') RETURNING *",
      [name]
    );
    return result.rows[0];
  }

  static async createCity(name, stateId) {
    const result = await pool.query(
      "INSERT INTO states_cities (name, type, parent_id) VALUES ($1, 'city', $2) RETURNING *",
      [name, stateId]
    );
    return result.rows[0];
  }

  static async update(id, name, isActive) {
    const result = await pool.query(
      'UPDATE states_cities SET name=$1, is_active=$2 WHERE id=$3 RETURNING *',
      [name, isActive, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM states_cities WHERE id=$1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = StatesCitiesModel;
