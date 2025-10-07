pragma circom 2.1.9;

include "../constants.circom";
include "../../selfrica/date/isValid.circom";
include "../../selfrica/date/isOlderThan.circom";
include "../../aadhaar/disclose/country_not_in_list.circom";
include "../../passport/customHashers.circom";

template DISCLOSE_PERSONA(
    MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH
){

  var persona_max_length = PERSONA_MAX_LENGTH();

  signal input persona_data[persona_max_length];
  signal input selector_persona_data[persona_max_length];

  signal input current_date[8];
  signal input majority_age_ASCII[3];
  signal input selector_older_than;
  signal input forbidden_countries_list[MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH * COUNTRY_LENGTH()];


  selector_older_than * (selector_older_than - 1) === 0;

  signal validity_ASCII[8];
  for (var i = 0; i < EXPIRATION_DATE_LENGTH(); i++) {
      validity_ASCII[i] <== persona_data[EXPIRATION_DATE_INDEX() + i];
  }

  IsValidFullYear()(current_date, validity_ASCII);

  signal birth_date_ASCII[8];
    for (var i = 0; i < DOB_LENGTH(); i++) {
        birth_date_ASCII[i] <== persona_data[DOB_INDEX() + i];
    }

  component is_older_than = IsOlderThan();
  is_older_than.majorityASCII <== majority_age_ASCII;
  is_older_than.currDate <== current_date;
  is_older_than.birthDateASCII <== birth_date_ASCII;
  signal is_older_than_result <== selector_older_than * is_older_than.out;

  signal revealed_data[persona_max_length + 1];
    for (var i = 0; i < persona_max_length; i++) {
        revealed_data[i] <== persona_data[i] * selector_persona_data[i];
    }

  signal majority_age_100 <== (majority_age_ASCII[0] - 48) * 100;
  signal majority_age_10 <== (majority_age_ASCII[1] - 48) * 10;
  signal majority_age_1 <== majority_age_ASCII[2] - 48;
  signal majority_age <== majority_age_100 + majority_age_10 + majority_age_1;

  revealed_data[persona_max_length] <== is_older_than_result * majority_age;

  component country_not_in_list_circuit = CountryNotInList(MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH, 3);

  for (var i = 0; i < COUNTRY_LENGTH(); i++) {
        country_not_in_list_circuit.country[i] <== persona_data[COUNTRY_INDEX() + i];
    }
  country_not_in_list_circuit.forbidden_countries_list <== forbidden_countries_list;

  var chunkLength = computeIntChunkLength(MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH * COUNTRY_LENGTH());
  signal output forbidden_countries_list_packed[chunkLength] <== country_not_in_list_circuit.forbidden_countries_list_packed;

  var revealed_data_packed_chunk_length = computeIntChunkLength(persona_max_length + 1);
  signal output revealedData_packed[revealed_data_packed_chunk_length] <== PackBytes(persona_max_length + 1)(revealed_data);
}
